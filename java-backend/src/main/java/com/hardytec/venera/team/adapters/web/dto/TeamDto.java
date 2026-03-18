package com.hardytec.venera.team.adapters.web.dto;

import com.hardytec.venera.team.domain.TeamRole;

import java.util.UUID;

public record TeamDto(
        UUID id,
        String name,
        String description,
        TeamRole role,
        long memberCount) {
}
