package com.hardytec.venera.team.adapters.persistence;

import com.hardytec.venera.team.domain.TeamInvitation;
import com.hardytec.venera.team.domain.TeamInvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {
    Optional<TeamInvitation> findByTeamIdAndEmailIgnoreCaseAndStatus(UUID teamId, String email, TeamInvitationStatus status);

    List<TeamInvitation> findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String email, TeamInvitationStatus status);
}
