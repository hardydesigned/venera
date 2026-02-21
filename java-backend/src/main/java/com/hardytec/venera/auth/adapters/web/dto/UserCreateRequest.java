package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull Boolean isActive,
        @NotBlank String role,
        @NotBlank Boolean onboardingCompleted,
        @Size(min = 8, message = "Password must contain at least 8 characters")
        String password) {
}
