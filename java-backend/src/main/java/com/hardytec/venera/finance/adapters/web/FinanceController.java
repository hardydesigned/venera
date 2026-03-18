package com.hardytec.venera.finance.adapters.web;

import com.hardytec.venera.auth.adapters.web.CurrentUserResolver;
import com.hardytec.venera.finance.adapters.web.dto.FinanceCategoryOptionDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceCategoryUpdateRequest;
import com.hardytec.venera.finance.adapters.web.dto.FinanceImportResultDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMappingDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMappingUpsertRequest;
import com.hardytec.venera.finance.adapters.web.dto.FinanceMonthSummaryDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceTransactionDto;
import com.hardytec.venera.finance.adapters.web.dto.FinanceYearSummaryDto;
import com.hardytec.venera.finance.application.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/finance")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class FinanceController {

    private final FinanceService financeService;
    private final CurrentUserResolver currentUserResolver;

    public FinanceController(FinanceService financeService, CurrentUserResolver currentUserResolver) {
        this.financeService = financeService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<FinanceCategoryOptionDto>> getCategories() {
        return ResponseEntity.ok(financeService.getCategories());
    }

    @GetMapping("/mappings")
    public ResponseEntity<List<FinanceMappingDto>> getMappings(
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(financeService.getMappings(userId, parseTeamId(teamHeader)));
    }

    @PutMapping("/mappings/{providerKey}")
    public ResponseEntity<FinanceMappingDto> upsertMapping(
            @PathVariable String providerKey,
            @Valid @RequestBody FinanceMappingUpsertRequest request,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        FinanceMappingDto saved = financeService.upsertMapping(userId, parseTeamId(teamHeader), providerKey, request);
        return ResponseEntity.status(HttpStatus.OK).body(saved);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FinanceImportResultDto> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("providerKey") String providerKey,
            @RequestParam(value = "dateColumn", required = false) String dateColumn,
            @RequestParam(value = "payeeColumn", required = false) String payeeColumn,
            @RequestParam(value = "purposeColumn", required = false) String purposeColumn,
            @RequestParam(value = "amountColumn", required = false) String amountColumn,
            @RequestParam(value = "delimiter", required = false) String delimiter,
            @RequestParam(value = "dateFormat", required = false) String dateFormat,
            @RequestParam(value = "saveMapping", required = false, defaultValue = "false") boolean saveMapping,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();

        FinanceService.MappingInput mappingInput = new FinanceService.MappingInput(
                dateColumn,
                payeeColumn,
                purposeColumn,
                amountColumn,
                delimiter,
                dateFormat);

        FinanceImportResultDto result = financeService.importTransactions(
                userId,
                parseTeamId(teamHeader),
                file,
                providerKey,
                mappingInput,
                saveMapping);

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/summary/year/{year}")
    public ResponseEntity<FinanceYearSummaryDto> getYearSummary(
            @PathVariable int year,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(financeService.getYearSummary(userId, parseTeamId(teamHeader), year));
    }

    @GetMapping("/summary/month/{year}/{month}")
    public ResponseEntity<FinanceMonthSummaryDto> getMonthSummary(
            @PathVariable int year,
            @PathVariable int month,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(financeService.getMonthSummary(userId, parseTeamId(teamHeader), year, month));
    }

    @PatchMapping("/transactions/{transactionId}/category")
    public ResponseEntity<FinanceTransactionDto> updateCategory(
            @PathVariable UUID transactionId,
            @Valid @RequestBody FinanceCategoryUpdateRequest request,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        FinanceTransactionDto updated = financeService.updateCategory(
                userId,
                parseTeamId(teamHeader),
                transactionId,
                request.category());
        return ResponseEntity.ok(updated);
    }

    private UUID parseTeamId(String teamHeader) {
        if (teamHeader == null || teamHeader.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(teamHeader);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid X-Team-Id header");
        }
    }
}
