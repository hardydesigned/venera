package com.hardytec.venera.finance.application;

import com.hardytec.venera.finance.adapters.web.dto.FinanceCategoryOptionDto;

import java.util.List;

public final class FinanceCategoryCatalog {
    private static final String DEFAULT_CATEGORY = "Standard";
    private static final List<String> CATEGORY_CODES = List.of(
            "A",
            "AB",
            "AR",
            "AT",
            "AUS",
            "E",
            "ES",
            "F",
            "FM",
            "G",
            "H",
            "M",
            "MW",
            "SE",
            "U",
            "V",
            "VAR",
            DEFAULT_CATEGORY
    );

    private FinanceCategoryCatalog() {
    }

    public static String defaultCategory() {
        return DEFAULT_CATEGORY;
    }

    public static List<FinanceCategoryOptionDto> all() {
        return CATEGORY_CODES.stream()
                .map(FinanceCategoryOptionDto::new)
                .toList();
    }
}
