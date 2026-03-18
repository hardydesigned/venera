package com.hardytec.venera.team.adapters.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTeamRequest(
        @NotBlank String name,
        String description) {
}
