package com.hardytec.venera.finance.adapters.web.dto;

public record FinanceImportResultDto(
        int importedCount,
        int skippedDuplicates,
        int uncertainCount) {
}
