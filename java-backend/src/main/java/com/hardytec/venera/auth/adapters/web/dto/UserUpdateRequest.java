package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Email String email,
        String firstName,
        String lastName,
        Boolean isActive,
        String role,
        Boolean onboardingCompleted,
        @Size(min = 8, message = "Password must contain at least 8 characters")
        String password) {
}
