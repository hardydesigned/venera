package com.hardytec.venera.team.adapters.web;

import com.hardytec.venera.auth.adapters.web.CurrentUserResolver;
import com.hardytec.venera.team.adapters.web.dto.CreateTeamRequest;
import com.hardytec.venera.team.adapters.web.dto.InviteMemberRequest;
import com.hardytec.venera.team.adapters.web.dto.TeamDto;
import com.hardytec.venera.team.adapters.web.dto.TeamInvitationDto;
import com.hardytec.venera.team.application.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class TeamController {

    private final TeamService teamService;
    private final CurrentUserResolver currentUserResolver;

    public TeamController(TeamService teamService, CurrentUserResolver currentUserResolver) {
        this.teamService = teamService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<TeamDto> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        UUID userId = currentUserResolver.getCurrentUserId();
        TeamDto created = teamService.createTeam(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<TeamDto>> getTeams() {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(teamService.getTeamsForUser(userId));
    }

    @PostMapping("/{teamId}/invites")
    public ResponseEntity<TeamInvitationDto> inviteMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody InviteMemberRequest request) {
        UUID userId = currentUserResolver.getCurrentUserId();
        TeamInvitationDto invitation = teamService.inviteMember(teamId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(invitation);
    }

    @GetMapping("/invites")
    public ResponseEntity<List<TeamInvitationDto>> getMyInvites() {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(teamService.getPendingInvitations(userId));
    }

    @PostMapping("/invites/{invitationId}/accept")
    public ResponseEntity<TeamInvitationDto> acceptInvite(@PathVariable UUID invitationId) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(teamService.acceptInvitation(invitationId, userId));
    }
}
