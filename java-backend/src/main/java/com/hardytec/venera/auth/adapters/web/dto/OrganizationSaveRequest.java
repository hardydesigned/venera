package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizationSaveRequest(
        @NotBlank String name,
        @NotBlank  String userId,
        String street,
        String zip,
        String city,
        String country) {
}
