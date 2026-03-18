package com.hardytec.venera.finance.adapters.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinanceMonthSummaryDto(
        int year,
        int month,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal net,
        List<FinanceCategoryTotalDto> totals,
        List<FinanceTransactionDto> transactions) {
}
