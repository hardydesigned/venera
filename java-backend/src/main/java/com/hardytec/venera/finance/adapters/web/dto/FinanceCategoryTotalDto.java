package com.hardytec.venera.finance.adapters.web.dto;

import java.math.BigDecimal;

public record FinanceCategoryTotalDto(
        String category,
        BigDecimal total) {
}
