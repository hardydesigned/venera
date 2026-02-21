package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String resetPasswordToken,
        @NotBlank @Size(min = 8) String newPassword) {
}
