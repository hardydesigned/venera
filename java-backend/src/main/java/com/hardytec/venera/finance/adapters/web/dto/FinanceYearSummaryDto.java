package com.hardytec.venera.finance.adapters.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinanceYearSummaryDto(
        int year,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal net,
        List<FinanceCategoryTotalDto> totals) {
}
