package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginResponse(@NotBlank String accessToken, @NotBlank String refreshToken, @NotBlank UserDto user) {
}
