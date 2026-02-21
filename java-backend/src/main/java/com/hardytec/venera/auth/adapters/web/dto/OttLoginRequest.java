package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record OttLoginRequest(
        @NotBlank(message = "Token wird benoetigt")
        String token) {
}

