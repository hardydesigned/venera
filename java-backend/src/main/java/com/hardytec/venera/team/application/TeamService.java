package com.hardytec.venera.team.application;

import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import com.hardytec.venera.auth.domain.UserAccount;
import com.hardytec.venera.team.adapters.persistence.TeamInvitationRepository;
import com.hardytec.venera.team.adapters.persistence.TeamMemberRepository;
import com.hardytec.venera.team.adapters.persistence.TeamRepository;
import com.hardytec.venera.team.adapters.web.dto.CreateTeamRequest;
import com.hardytec.venera.team.adapters.web.dto.InviteMemberRequest;
import com.hardytec.venera.team.adapters.web.dto.TeamDto;
import com.hardytec.venera.team.adapters.web.dto.TeamInvitationDto;
import com.hardytec.venera.team.domain.Team;
import com.hardytec.venera.team.domain.TeamInvitation;
import com.hardytec.venera.team.domain.TeamInvitationStatus;
import com.hardytec.venera.team.domain.TeamMember;
import com.hardytec.venera.team.domain.TeamRole;

import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            TeamInvitationRepository teamInvitationRepository,
            UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamInvitationRepository = teamInvitationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamDto createTeam(CreateTeamRequest request, UUID currentUserId) {
        String trimmedName = request.name().trim();
        if (trimmedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name required");
        }

        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setOwnerUserId(currentUserId);
        team.setName(trimmedName);
        team.setDescription(trimToNull(request.description()));
        Team savedTeam = teamRepository.save(team);

        TeamMember ownerMembership = new TeamMember();
        ownerMembership.setId(UUID.randomUUID());
        ownerMembership.setTeamId(savedTeam.getId());
        ownerMembership.setUserId(currentUserId);
        ownerMembership.setRole(TeamRole.OWNER);
        teamMemberRepository.save(ownerMembership);

        return toTeamDto(savedTeam, ownerMembership.getRole());
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getTeamsForUser(UUID currentUserId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(currentUserId);
        if (memberships.isEmpty()) {
            return List.of();
        }

        Map<UUID, TeamMember> memberByTeamId = memberships.stream()
                .collect(Collectors.toMap(TeamMember::getTeamId, Function.identity()));

        if (memberByTeamId.isEmpty() || memberByTeamId.keySet() == null) {
            return List.of();
        }
        
        List<Team> teams = teamRepository.findAllById(memberByTeamId.keySet());

        return teams.stream()
                .sorted(Comparator.comparing(Team::getName, String.CASE_INSENSITIVE_ORDER))
                .map(team -> {
                    TeamMember member = memberByTeamId.get(team.getId());
                    return toTeamDto(team, member.getRole());
                })
                .toList();
    }

    @Transactional
    public TeamInvitationDto inviteMember(UUID teamId, InviteMemberRequest request, UUID currentUserId) {
        Team team = getTeamOrThrow(teamId);
        TeamMember inviterMembership = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a team member"));
        if (inviterMembership.getRole() != TeamRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can invite members");
        }

        String email = request.email().trim().toLowerCase();
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email required");
        }

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (teamMemberRepository.existsByTeamIdAndUserId(teamId, user.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a team member");
            }
        });

        TeamInvitation existing = teamInvitationRepository
                .findByTeamIdAndEmailIgnoreCaseAndStatus(teamId, email, TeamInvitationStatus.PENDING)
                .orElse(null);
        if (existing != null) {
            return toInvitationDto(existing, team.getName());
        }

        TeamInvitation invitation = new TeamInvitation();
        invitation.setId(UUID.randomUUID());
        invitation.setTeamId(teamId);
        invitation.setEmail(email);
        invitation.setInvitedByUserId(currentUserId);
        invitation.setStatus(TeamInvitationStatus.PENDING);

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        return toInvitationDto(saved, team.getName());
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationDto> getPendingInvitations(UUID currentUserId) {
        UserAccount currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<TeamInvitation> invitations = teamInvitationRepository
                .findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(currentUser.getEmail(), TeamInvitationStatus.PENDING);
        if (invitations.isEmpty()) {
            return List.of();
        }

        Set<UUID> teamIds = invitations.stream()
                .map(TeamInvitation::getTeamId)
                .collect(Collectors.toSet());
        Map<UUID, Team> teamsById = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, Function.identity()));

        return invitations.stream()
                .map(invitation -> {
                    Team team = teamsById.get(invitation.getTeamId());
                    String teamName = team != null ? team.getName() : "Unbekanntes Team";
                    return toInvitationDto(invitation, teamName);
                })
                .toList();
    }

    @Transactional
    public TeamInvitationDto acceptInvitation(UUID invitationId, UUID currentUserId) {
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (invitation.getStatus() != TeamInvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is no longer pending");
        }

        UserAccount currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!currentUser.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invitation does not belong to current user");
        }

        Team team = getTeamOrThrow(invitation.getTeamId());

        if (!teamMemberRepository.existsByTeamIdAndUserId(team.getId(), currentUserId)) {
            TeamMember member = new TeamMember();
            member.setId(UUID.randomUUID());
            member.setTeamId(team.getId());
            member.setUserId(currentUserId);
            member.setRole(TeamRole.MEMBER);
            teamMemberRepository.save(member);
        }

        invitation.setStatus(TeamInvitationStatus.ACCEPTED);
        invitation.setRespondedAt(Instant.now());
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        return toInvitationDto(saved, team.getName());
    }

    @Transactional(readOnly = true)
    public void assertTeamMember(UUID teamId, UUID userId) {
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this team");
        }
    }

    private Team getTeamOrThrow(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
    }

    private TeamDto toTeamDto(Team team, TeamRole role) {
        long memberCount = teamMemberRepository.countByTeamId(team.getId());
        return new TeamDto(team.getId(), team.getName(), team.getDescription(), role, memberCount);
    }

    private TeamInvitationDto toInvitationDto(TeamInvitation invitation, String teamName) {
        return new TeamInvitationDto(
                invitation.getId(),
                invitation.getTeamId(),
                teamName,
                invitation.getEmail(),
                invitation.getStatus(),
                invitation.getInvitedByUserId(),
                invitation.getCreatedAt(),
                invitation.getRespondedAt());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
