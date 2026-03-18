package com.hardytec.venera.finance.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record FinanceCategoryUpdateRequest(
        @NotBlank String category) {
}
