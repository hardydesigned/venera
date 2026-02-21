package com.hardytec.venera.auth.adapters.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OttRequest(
        @NotBlank(message = "E-Mail wird benoetigt")
        @Email(message = "Ungueltige E-Mail-Adresse")
        String email) {
}

