package com.hardytec.venera.team.adapters.web.dto;

import com.hardytec.venera.team.domain.TeamInvitationStatus;

import java.time.Instant;
import java.util.UUID;

public record TeamInvitationDto(
        UUID id,
        UUID teamId,
        String teamName,
        String email,
        TeamInvitationStatus status,
        UUID invitedByUserId,
        Instant createdAt,
        Instant respondedAt) {
}
