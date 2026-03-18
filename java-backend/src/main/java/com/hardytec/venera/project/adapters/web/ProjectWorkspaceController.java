package com.hardytec.venera.project.adapters.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.hardytec.venera.auth.adapters.web.CurrentUserResolver;
import com.hardytec.venera.project.application.ProjectWorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/projects/workspace")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class ProjectWorkspaceController {

    private final ProjectWorkspaceService projectWorkspaceService;
    private final CurrentUserResolver currentUserResolver;

    public ProjectWorkspaceController(ProjectWorkspaceService projectWorkspaceService, CurrentUserResolver currentUserResolver) {
        this.projectWorkspaceService = projectWorkspaceService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public ResponseEntity<JsonNode> getWorkspace(
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        JsonNode workspace = projectWorkspaceService.getWorkspace(userId, parseTeamId(teamHeader));
        return ResponseEntity.ok(workspace);
    }

    @PutMapping
    public ResponseEntity<JsonNode> saveWorkspace(
            @RequestBody JsonNode payload,
            @RequestHeader(value = "X-Team-Id", required = false) String teamHeader) {
        UUID userId = currentUserResolver.getCurrentUserId();
        JsonNode saved = projectWorkspaceService.saveWorkspace(userId, parseTeamId(teamHeader), payload);
        return ResponseEntity.status(HttpStatus.OK).body(saved);
    }

    private UUID parseTeamId(String teamHeader) {
        if (teamHeader == null || teamHeader.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(teamHeader);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid X-Team-Id header");
        }
    }
}
