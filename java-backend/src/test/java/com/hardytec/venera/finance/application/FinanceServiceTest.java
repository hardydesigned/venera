package com.hardytec.venera.finance.application;

import com.hardytec.venera.finance.adapters.persistence.FinanceColumnMappingRepository;
import com.hardytec.venera.finance.adapters.persistence.FinanceTransactionRepository;
import com.hardytec.venera.finance.adapters.web.dto.FinanceImportResultDto;
import com.hardytec.venera.finance.domain.FinanceTransaction;
import com.hardytec.venera.team.application.TeamService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceServiceTest {

    @Mock
    private FinanceColumnMappingRepository mappingRepository;

    @Mock
    private FinanceTransactionRepository transactionRepository;

    @Mock
    private TeamService teamService;

    @InjectMocks
    private FinanceService financeService;

    @Test
    void importsTransactionsWithTwoDigitYearDate() {
        UUID userId = UUID.randomUUID();
        String csv = "\"Buchungsdatum\";\"Wertstellung\";\"Status\";\"Zahlungspflichtige*r\";\"Zahlungsempfänger*in\";\"Verwendungszweck\";\"Umsatztyp\";\"IBAN\";\"Betrag (€)\";\"Gläubiger-ID\";\"Mandatsreferenz\";\"Kundenreferenz\"\n"
                + "\"03.03.26\";\"03.03.26\";\"Gebucht\";\"ISSUER\";\"Udemy\";\"VISA Debitkartenumsatz vom 02.03.2026\";\"Ausgang\";\"DE96120300009005290904\";\"-14,99\";\"\";\"\";\"486061811993653\"";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "finance.csv",
                "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));

        FinanceService.MappingInput mapping = new FinanceService.MappingInput(
                "Buchungsdatum",
                "Zahlungsempfänger*in",
                "Verwendungszweck",
                "Betrag (€)",
                ";",
                "dd.MM.yyyy");

        when(transactionRepository.existsByUserIdAndTeamIdIsNullAndDedupeHash(eq(userId), anyString())).thenReturn(false);

        FinanceImportResultDto result = financeService.importTransactions(userId, null, file, "ing", mapping, false);

        assertEquals(1, result.importedCount());
        assertEquals(0, result.skippedDuplicates());
        assertEquals(0, result.uncertainCount());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<FinanceTransaction>> transactionsCaptor = ArgumentCaptor.forClass(List.class);
        verify(transactionRepository).saveAll(transactionsCaptor.capture());

        FinanceTransaction saved = transactionsCaptor.getValue().get(0);
        assertEquals(LocalDate.of(2026, 3, 3), saved.getBookingDate());
        assertEquals(new BigDecimal("-14.99"), saved.getAmount());
        assertEquals("Udemy", saved.getPayee());
    }

    @Test
    void importsTransactionsWhenFirstHeaderContainsBomAndQuotes() {
        UUID userId = UUID.randomUUID();
        String csv = "\uFEFF\"Buchungsdatum\";\"Wertstellung\";\"Status\";\"Zahlungspflichtige*r\";\"Zahlungsempfänger*in\";\"Verwendungszweck\";\"Umsatztyp\";\"IBAN\";\"Betrag (€)\";\"Gläubiger-ID\";\"Mandatsreferenz\";\"Kundenreferenz\"\n"
                + "\"03.03.26\";\"03.03.26\";\"Gebucht\";\"ISSUER\";\"Udemy\";\"VISA Debitkartenumsatz vom 02.03.2026\";\"Ausgang\";\"DE96120300009005290904\";\"-14,99\";\"\";\"\";\"486061811993653\"";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "finance-bom.csv",
                "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));

        FinanceService.MappingInput mapping = new FinanceService.MappingInput(
                "Buchungsdatum",
                "Zahlungsempfänger*in",
                "Verwendungszweck",
                "Betrag (€)",
                ";",
                "dd.MM.yyyy");

        when(transactionRepository.existsByUserIdAndTeamIdIsNullAndDedupeHash(eq(userId), anyString())).thenReturn(false);

        FinanceImportResultDto result = financeService.importTransactions(userId, null, file, "ing", mapping, false);

        assertEquals(1, result.importedCount());
        assertEquals(0, result.skippedDuplicates());
        assertEquals(0, result.uncertainCount());
    }
}
