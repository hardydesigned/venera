package com.hardytec.venera.finance.adapters.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinanceTransactionDto(
        UUID id,
        LocalDate bookingDate,
        String payee,
        String purpose,
        BigDecimal amount,
        String category,
        Double confidence,
        boolean lowConfidence,
        boolean manualOverride) {
}
