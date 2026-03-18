package com.hardytec.venera.finance.application;

import com.hardytec.venera.finance.adapters.persistence.FinanceColumnMappingRepository;
import com.hardytec.venera.finance.adapters.persistence.FinanceTransactionRepository;
import com.hardytec.venera.finance.adapters.web.dto.FinanceCategoryOptionDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceCategoryTotalDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceImportResultDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMappingDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMappingUpsertRequest;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMonthSummaryDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceTransactionDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceYearSummaryDto;
import com.hardytec.venera.finance.domain.FinanceColumnMapping;
import com.hardytec.venera.finance.domain.FinanceTransaction;
import com.hardytec.venera.team.application.TeamService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class FinanceService {

    private static final double LOW_CONFIDENCE_THRESHOLD = 0.70;
    private static final int SKIP_SAMPLE_LIMIT = 8;
    private static final Logger log = LoggerFactory.getLogger(FinanceService.class);

    private final FinanceColumnMappingRepository mappingRepository;
    private final FinanceTransactionRepository transactionRepository;
    private final TeamService teamService;
    private final FinancePredictionService predictionService;

    public FinanceService(
            FinanceColumnMappingRepository mappingRepository,
            FinanceTransactionRepository transactionRepository,
            TeamService teamService,
            FinancePredictionService predictionService) {
        this.mappingRepository = mappingRepository;
        this.transactionRepository = transactionRepository;
        this.teamService = teamService;
        this.predictionService = predictionService;
    }

    public List<FinanceCategoryOptionDto> getCategories() {
        return FinanceCategoryCatalog.all();
    }

    @Transactional(readOnly = true)
    public List<FinanceMappingDto> getMappings(UUID userId, UUID teamId) {
        Scope scope = resolveScope(userId, teamId);
        List<FinanceColumnMapping> mappings = scope.teamId() != null
                ? mappingRepository.findByTeamIdOrderByProviderKeyAsc(scope.teamId())
                : mappingRepository.findByUserIdAndTeamIdIsNullOrderByProviderKeyAsc(scope.userId());

        return mappings.stream().map(this::toMappingDto).toList();
    }

    @Transactional
    public FinanceMappingDto upsertMapping(UUID userId, UUID teamId, String providerKey, FinanceMappingUpsertRequest request) {
        Scope scope = resolveScope(userId, teamId);
        String normalizedProviderKey = normalizeProviderKey(providerKey);

        FinanceColumnMapping mapping = findMappingByScopeAndProvider(scope, normalizedProviderKey)
                .orElseGet(() -> {
                    FinanceColumnMapping created = new FinanceColumnMapping();
                    created.setId(UUID.randomUUID());
                    created.setUserId(scope.userId());
                    created.setTeamId(scope.teamId());
                    created.setProviderKey(normalizedProviderKey);
                    return created;
                });

        mapping.setDateColumn(requireValue(request.dateColumn(), "dateColumn"));
        mapping.setPayeeColumn(requireValue(request.payeeColumn(), "payeeColumn"));
        mapping.setPurposeColumn(requireValue(request.purposeColumn(), "purposeColumn"));
        mapping.setAmountColumn(requireValue(request.amountColumn(), "amountColumn"));
        mapping.setDelimiter(resolveDelimiterString(request.delimiter()));
        mapping.setDateFormat(trimToNull(request.dateFormat()));

        return toMappingDto(mappingRepository.save(mapping));
    }

    @Transactional
    public FinanceImportResultDto importTransactions(
            UUID userId,
            UUID teamId,
            MultipartFile file,
            String providerKey,
            MappingInput input,
            boolean saveMapping) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is required");
        }

        Scope scope = resolveScope(userId, teamId);
        String normalizedProviderKey = normalizeProviderKey(providerKey);
        MappingInput resolved = resolveMappingInput(scope, normalizedProviderKey, input);

        if (saveMapping) {
            upsertMapping(scope.userId(), scope.teamId(), normalizedProviderKey, new FinanceMappingUpsertRequest(
                    resolved.dateColumn(),
                    resolved.payeeColumn(),
                    resolved.purposeColumn(),
                    resolved.amountColumn(),
                    resolved.delimiter(),
                    resolved.dateFormat()));
        }

        List<RowCandidate> candidates = new ArrayList<>();
        int skippedDuplicates = 0;
        int skippedMissingFields = 0;
        int skippedParseErrors = 0;
        int totalRows = 0;
        List<String> missingFieldSamples = new ArrayList<>();
        List<String> parseErrorSamples = new ArrayList<>();
        Set<String> seenHashes = new java.util.HashSet<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreSurroundingSpaces(true)
                     .setDelimiter(resolveDelimiterChar(resolved.delimiter()))
                     .build()
                     .parse(reader)) {

            log.info(
                    "Finance import started: providerKey={}, userId={}, teamId={}, dateColumn='{}', payeeColumn='{}', purposeColumn='{}', amountColumn='{}', delimiter='{}', dateFormat='{}', file='{}' ({} bytes)",
                    normalizedProviderKey,
                    scope.userId(),
                    scope.teamId(),
                    resolved.dateColumn(),
                    resolved.payeeColumn(),
                    resolved.purposeColumn(),
                    resolved.amountColumn(),
                    resolved.delimiter(),
                    resolved.dateFormat(),
                    file.getOriginalFilename(),
                    file.getSize());

            log.info("Finance import headers detected: {}", parser.getHeaderNames());
            String dateHeader = resolveHeaderName(parser.getHeaderMap().keySet(), resolved.dateColumn());
            String payeeHeader = resolveHeaderName(parser.getHeaderMap().keySet(), resolved.payeeColumn());
            String purposeHeader = resolveHeaderName(parser.getHeaderMap().keySet(), resolved.purposeColumn());
            String amountHeader = resolveHeaderName(parser.getHeaderMap().keySet(), resolved.amountColumn());
            log.info(
                    "Finance import resolved headers: date='{}' -> '{}', payee='{}' -> '{}', purpose='{}' -> '{}', amount='{}' -> '{}'",
                    resolved.dateColumn(),
                    dateHeader,
                    resolved.payeeColumn(),
                    payeeHeader,
                    resolved.purposeColumn(),
                    purposeHeader,
                    resolved.amountColumn(),
                    amountHeader);

            for (CSVRecord record : parser) {
                totalRows++;
                String bookingDateRaw = value(record, dateHeader);
                String payeeRaw = value(record, payeeHeader);
                String purposeRaw = value(record, purposeHeader);
                String amountRaw = value(record, amountHeader);

                if (bookingDateRaw == null || payeeRaw == null || amountRaw == null) {
                    skippedMissingFields++;
                    addSample(
                            missingFieldSamples,
                            "row=%d missingFields=[date:%s,payee:%s,amount:%s] values=[date:'%s',payee:'%s',amount:'%s']".formatted(
                                    record.getRecordNumber(),
                                    bookingDateRaw == null,
                                    payeeRaw == null,
                                    amountRaw == null,
                                    bookingDateRaw,
                                    payeeRaw,
                                    amountRaw));
                    continue;
                }

                LocalDate bookingDate;
                BigDecimal amount;
                try {
                    bookingDate = parseDate(bookingDateRaw, resolved.dateFormat());
                    amount = parseAmount(amountRaw);
                } catch (IllegalArgumentException ex) {
                    skippedParseErrors++;
                    addSample(
                            parseErrorSamples,
                            "row=%d parseError=%s values=[date:'%s',amount:'%s',payee:'%s',purpose:'%s']".formatted(
                                    record.getRecordNumber(),
                                    ex.getMessage(),
                                    bookingDateRaw,
                                    amountRaw,
                                    payeeRaw,
                                    purposeRaw));
                    continue;
                }

                String dedupeHash = dedupeHash(normalizedProviderKey, bookingDate, payeeRaw, purposeRaw, amount);
                if (!seenHashes.add(dedupeHash) || existsDedupe(scope, dedupeHash)) {
                    skippedDuplicates++;
                    continue;
                }

                candidates.add(new RowCandidate(bookingDate, payeeRaw.trim(), trimToNull(purposeRaw), amount, dedupeHash));
            }
        } catch (Exception ex) {
            log.warn("Finance import failed during CSV parsing: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not parse CSV file");
        }

        List<FinancePredictionService.PredictionInput> predictionInputs = candidates.stream()
                .map(row -> new FinancePredictionService.PredictionInput(
                        row.bookingDate(),
                        row.payee(),
                        row.purpose(),
                        row.amount()))
                .toList();
        List<FinancePredictionService.PredictionResult> predictions = predictionService.predictBatch(predictionInputs);

        List<FinanceTransaction> toSave = new ArrayList<>();
        int uncertainCount = 0;

        for (int i = 0; i < candidates.size(); i++) {
            RowCandidate row = candidates.get(i);
            FinancePredictionService.PredictionResult prediction = predictions.get(i);
            String category = trimToNull(prediction.category());
            if (category == null) {
                category = FinanceCategoryCatalog.defaultCategory();
            }
            double confidence = prediction.confidence();
            if (confidence < LOW_CONFIDENCE_THRESHOLD) {
                uncertainCount++;
            }

            FinanceTransaction tx = new FinanceTransaction();
            tx.setId(UUID.randomUUID());
            tx.setUserId(scope.userId());
            tx.setTeamId(scope.teamId());
            tx.setBookingDate(row.bookingDate());
            tx.setPayee(row.payee());
            tx.setPurpose(row.purpose());
            tx.setAmount(row.amount().setScale(2, RoundingMode.HALF_UP));
            tx.setCategoryMain(category);
            tx.setCategorySub(null);
            tx.setConfidence(confidence);
            tx.setSourceProviderKey(normalizedProviderKey);
            tx.setDedupeHash(row.dedupeHash());
            tx.setManualOverride(false);
            toSave.add(tx);
        }

        transactionRepository.saveAll(toSave);
        log.info(
                "Finance import finished: providerKey={}, totalRows={}, importedCount={}, skippedDuplicates={}, skippedMissingFields={}, skippedParseErrors={}, uncertainCount={}",
                normalizedProviderKey,
                totalRows,
                toSave.size(),
                skippedDuplicates,
                skippedMissingFields,
                skippedParseErrors,
                uncertainCount);
        if (!missingFieldSamples.isEmpty()) {
            log.info("Finance import missing-field samples: {}", missingFieldSamples);
        }
        if (!parseErrorSamples.isEmpty()) {
            log.info("Finance import parse-error samples: {}", parseErrorSamples);
        }
        return new FinanceImportResultDto(toSave.size(), skippedDuplicates, uncertainCount);
    }

    @Transactional(readOnly = true)
    public FinanceYearSummaryDto getYearSummary(UUID userId, UUID teamId, int year) {
        Scope scope = resolveScope(userId, teamId);
        List<FinanceTransaction> transactions = scope.teamId() != null
                ? transactionRepository.findAllForTeamAndYear(scope.teamId(), year)
                : transactionRepository.findAllForUserAndYear(scope.userId(), year);
        return summarizeYear(year, transactions);
    }

    @Transactional(readOnly = true)
    public FinanceMonthSummaryDto getMonthSummary(UUID userId, UUID teamId, int year, int month) {
        Scope scope = resolveScope(userId, teamId);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();

        List<FinanceTransaction> transactions = scope.teamId() != null
                ? transactionRepository.findByTeamIdAndBookingDateBetweenOrderByBookingDateDesc(scope.teamId(), from, to)
                : transactionRepository.findByUserIdAndTeamIdIsNullAndBookingDateBetweenOrderByBookingDateDesc(scope.userId(), from, to);

        BigDecimal income = sumIncome(transactions);
        BigDecimal expenses = sumExpenses(transactions);
        BigDecimal net = income.subtract(expenses).setScale(2, RoundingMode.HALF_UP);

        List<FinanceCategoryTotalDto> totals = categoryTotals(transactions);
        List<FinanceTransactionDto> txDtos = transactions.stream()
                .sorted(Comparator.comparing(FinanceTransaction::getBookingDate).reversed())
                .map(this::toTransactionDto)
                .toList();

        return new FinanceMonthSummaryDto(year, month, income, expenses, net, totals, txDtos);
    }

    @Transactional
    public FinanceTransactionDto updateCategory(UUID userId, UUID teamId, UUID transactionId, String category) {
        Scope scope = resolveScope(userId, teamId);
        String requestedCategory = requireValue(category, "category");

        FinanceTransaction transaction = scope.teamId() != null
                ? transactionRepository.findByIdAndTeamId(transactionId, scope.teamId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"))
                : transactionRepository.findByIdAndUserIdAndTeamIdIsNull(transactionId, scope.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        transaction.setCategoryMain(requestedCategory.trim());
        transaction.setCategorySub(null);
        transaction.setManualOverride(true);
        transaction.setConfidence(1.0d);

        return toTransactionDto(transactionRepository.save(transaction));
    }

    private FinanceYearSummaryDto summarizeYear(int year, List<FinanceTransaction> transactions) {
        BigDecimal income = sumIncome(transactions);
        BigDecimal expenses = sumExpenses(transactions);
        BigDecimal net = income.subtract(expenses).setScale(2, RoundingMode.HALF_UP);

        return new FinanceYearSummaryDto(year, income, expenses, net, categoryTotals(transactions));
    }

    private List<FinanceCategoryTotalDto> categoryTotals(List<FinanceTransaction> transactions) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();

        for (FinanceTransaction tx : transactions) {
            String category = tx.getCategoryMain() == null ? "Unkategorisiert" : tx.getCategoryMain();
            totals.put(category, totals.getOrDefault(category, BigDecimal.ZERO).add(tx.getAmount()));
        }

        return totals.entrySet().stream()
                .map(entry -> new FinanceCategoryTotalDto(
                        entry.getKey(),
                        entry.getValue().setScale(2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing((FinanceCategoryTotalDto dto) -> dto.total().abs()).reversed())
                .toList();
    }

    private BigDecimal sumIncome(List<FinanceTransaction> transactions) {
        return transactions.stream()
                .map(FinanceTransaction::getAmount)
                .filter(value -> value.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumExpenses(List<FinanceTransaction> transactions) {
        return transactions.stream()
                .map(FinanceTransaction::getAmount)
                .filter(value -> value.compareTo(BigDecimal.ZERO) < 0)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private Scope resolveScope(UUID userId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            return new Scope(null, teamId);
        }
        return new Scope(userId, null);
    }

    private Optional<FinanceColumnMapping> findMappingByScopeAndProvider(Scope scope, String providerKey) {
        if (scope.teamId() != null) {
            return mappingRepository.findByTeamIdAndProviderKeyIgnoreCase(scope.teamId(), providerKey);
        }
        return mappingRepository.findByUserIdAndTeamIdIsNullAndProviderKeyIgnoreCase(scope.userId(), providerKey);
    }

    private MappingInput resolveMappingInput(Scope scope, String providerKey, MappingInput input) {
        if (input.isComplete()) {
            return input.withNormalizedDefaults();
        }

        FinanceColumnMapping mapping = findMappingByScopeAndProvider(scope, providerKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing mapping: provide mapping fields or save one first"));

        return new MappingInput(
                mapping.getDateColumn(),
                mapping.getPayeeColumn(),
                mapping.getPurposeColumn(),
                mapping.getAmountColumn(),
                mapping.getDelimiter(),
                mapping.getDateFormat()).withNormalizedDefaults();
    }

    private boolean existsDedupe(Scope scope, String dedupeHash) {
        if (scope.teamId() != null) {
            return transactionRepository.existsByTeamIdAndDedupeHash(scope.teamId(), dedupeHash);
        }
        return transactionRepository.existsByUserIdAndTeamIdIsNullAndDedupeHash(scope.userId(), dedupeHash);
    }

    private String value(CSVRecord record, String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            String value = record.get(header);
            if (value == null || value.isBlank()) {
                return null;
            }
            return value;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String resolveHeaderName(Set<String> availableHeaders, String requestedHeader) {
        if (requestedHeader == null || requestedHeader.isBlank()) {
            return null;
        }
        if (availableHeaders.contains(requestedHeader)) {
            return requestedHeader;
        }

        String requestedNormalized = normalizeHeaderName(requestedHeader);
        for (String available : availableHeaders) {
            if (normalizeHeaderName(available).equals(requestedNormalized)) {
                return available;
            }
        }
        return requestedHeader;
    }

    private String normalizeHeaderName(String header) {
        if (header == null) {
            return "";
        }
        String normalized = header
                .replace("\uFEFF", "")
                .trim();

        while (normalized.startsWith("\"")) {
            normalized = normalized.substring(1).trim();
        }
        while (normalized.endsWith("\"")) {
            normalized = normalized.substring(0, normalized.length() - 1).trim();
        }

        return normalized.toLowerCase(Locale.ROOT);
    }

    private LocalDate parseDate(String value, String preferredFormat) {
        String trimmed = value.trim();

        List<DateTimeFormatter> formatters = new ArrayList<>();
        if (preferredFormat != null && !preferredFormat.isBlank()) {
            formatters.add(DateTimeFormatter.ofPattern(preferredFormat));
        }
        formatters.add(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
        formatters.add(DateTimeFormatter.ofPattern("d.M.yyyy"));
        formatters.add(DateTimeFormatter.ofPattern("dd.MM.yy"));
        formatters.add(DateTimeFormatter.ofPattern("d.M.yy"));
        formatters.add(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        formatters.add(DateTimeFormatter.ofPattern("yy-MM-dd"));
        formatters.add(DateTimeFormatter.ofPattern("MM/dd/yyyy"));
        formatters.add(DateTimeFormatter.ofPattern("MM/dd/yy"));

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(trimmed, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        throw new IllegalArgumentException("invalid date");
    }

    private BigDecimal parseAmount(String value) {
        String normalized = value.trim()
                .replace("EUR", "")
                .replace("€", "")
                .replace(" ", "")
                .replace("'", "");

        // Handle trailing minus sign (common in bank exports)
        boolean trailingMinus = normalized.endsWith("-");
        if (trailingMinus) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        int lastComma = normalized.lastIndexOf(',');
        int lastDot = normalized.lastIndexOf('.');

        if (lastComma >= 0 && lastDot >= 0) {
            if (lastComma > lastDot) {
                normalized = normalized.replace(".", "").replace(',', '.');
            } else {
                normalized = normalized.replace(",", "");
            }
        } else if (lastComma >= 0) {
            normalized = normalized.replace('.', ' ')
                    .replace(" ", "")
                    .replace(',', '.');
        } else {
            normalized = normalized.replace(",", "");
        }

        BigDecimal parsed = new BigDecimal(normalized);
        if (trailingMinus) {
            parsed = parsed.negate();
        }

        return parsed.setScale(2, RoundingMode.HALF_UP);
    }

    private String dedupeHash(String providerKey, LocalDate bookingDate, String payee, String purpose, BigDecimal amount) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String payload = String.join("|",
                    providerKey,
                    bookingDate.toString(),
                    normalizeHashField(payee),
                    normalizeHashField(purpose),
                    amount.setScale(2, RoundingMode.HALF_UP).toPlainString());
            byte[] hashed = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not hash finance transaction");
        }
    }

    private String normalizeHashField(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeProviderKey(String value) {
        String normalized = requireValue(value, "providerKey").toLowerCase(Locale.ROOT).trim();
        return normalized.replaceAll("\\s+", "-");
    }

    private char resolveDelimiterChar(String delimiter) {
        String resolved = resolveDelimiterString(delimiter);
        return resolved.charAt(0);
    }

    private String resolveDelimiterString(String delimiter) {
        if (delimiter == null || delimiter.isBlank()) {
            return ";";
        }
        String value = delimiter.trim();
        if (value.length() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delimiter must be a single character");
        }
        return value;
    }

    private String requireValue(String value, String fieldName) {
        if (value == null || value.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void addSample(List<String> samples, String sample) {
        if (samples.size() < SKIP_SAMPLE_LIMIT) {
            samples.add(sample);
        }
    }

    private FinanceMappingDto toMappingDto(FinanceColumnMapping mapping) {
        return new FinanceMappingDto(
                mapping.getId(),
                mapping.getProviderKey(),
                mapping.getDateColumn(),
                mapping.getPayeeColumn(),
                mapping.getPurposeColumn(),
                mapping.getAmountColumn(),
                mapping.getDelimiter(),
                mapping.getDateFormat(),
                mapping.getUpdatedAt());
    }

    private FinanceTransactionDto toTransactionDto(FinanceTransaction tx) {
        double confidence = tx.getConfidence() == null ? 0d : tx.getConfidence();
        boolean lowConfidence = !tx.isManualOverride() && confidence < LOW_CONFIDENCE_THRESHOLD;
        return new FinanceTransactionDto(
                tx.getId(),
                tx.getBookingDate(),
                tx.getPayee(),
                tx.getPurpose(),
                tx.getAmount(),
                tx.getCategoryMain(),
                tx.getConfidence(),
                lowConfidence,
                tx.isManualOverride());
    }

    public record MappingInput(
            String dateColumn,
            String payeeColumn,
            String purposeColumn,
            String amountColumn,
            String delimiter,
            String dateFormat) {

        public boolean isComplete() {
            return hasText(dateColumn)
                    && hasText(payeeColumn)
                    && hasText(purposeColumn)
                    && hasText(amountColumn);
        }

        public MappingInput withNormalizedDefaults() {
            return new MappingInput(
                    trim(dateColumn),
                    trim(payeeColumn),
                    trim(purposeColumn),
                    trim(amountColumn),
                    hasText(delimiter) ? delimiter.trim() : ";",
                    hasText(dateFormat) ? dateFormat.trim() : null);
        }

        private static boolean hasText(String value) {
            return value != null && !value.trim().isEmpty();
        }

        private static String trim(String value) {
            return Objects.requireNonNullElse(value, "").trim();
        }
    }

    private record Scope(UUID userId, UUID teamId) {
    }

    private record RowCandidate(
            LocalDate bookingDate,
            String payee,
            String purpose,
            BigDecimal amount,
            String dedupeHash) {
    }
}
