package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.OffsetDateTime;

public record UserDto(
        @NotBlank String id,
        @NotBlank @Email String email,
        String firstName,
        String lastName,
        boolean active,
        boolean onboardingCompleted,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
