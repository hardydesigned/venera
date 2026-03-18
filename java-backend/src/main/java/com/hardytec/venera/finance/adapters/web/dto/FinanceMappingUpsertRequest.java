package com.hardytec.venera.finance.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record FinanceMappingUpsertRequest(
        @NotBlank String dateColumn,
        @NotBlank String payeeColumn,
        @NotBlank String purposeColumn,
        @NotBlank String amountColumn,
        String delimiter,
        String dateFormat) {
}
