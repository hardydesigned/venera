package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.OffsetDateTime;

public record OrganizationDto(
       @NotBlank String id,
       @NotBlank String name,
        String street,
        String zip,
        String city,
        String country,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
