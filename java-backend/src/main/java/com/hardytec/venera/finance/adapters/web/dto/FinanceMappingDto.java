package com.hardytec.venera.finance.adapters.web.dto;

import java.time.Instant;
import java.util.UUID;

public record FinanceMappingDto(
        UUID id,
        String providerKey,
        String dateColumn,
        String payeeColumn,
        String purposeColumn,
        String amountColumn,
        String delimiter,
        String dateFormat,
        Instant updatedAt) {
}
