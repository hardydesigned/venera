package com.hardytec.venera.project.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hardytec.venera.project.adapters.persistence.ProjectWorkspaceRepository;
import com.hardytec.venera.project.domain.ProjectWorkspace;
import com.hardytec.venera.team.application.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class ProjectWorkspaceService {

    private static final String DEFAULT_PAYLOAD = "{\"projects\":[],\"folders\":[]}";

    private final ProjectWorkspaceRepository projectWorkspaceRepository;
    private final TeamService teamService;
    private final ObjectMapper objectMapper;

    public ProjectWorkspaceService(
            ProjectWorkspaceRepository projectWorkspaceRepository,
            TeamService teamService,
            ObjectMapper objectMapper) {
        this.projectWorkspaceRepository = projectWorkspaceRepository;
        this.teamService = teamService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public JsonNode getWorkspace(UUID userId, UUID teamId) {
        ProjectWorkspace workspace = findOrCreateWorkspace(userId, teamId);
        return parsePayload(workspace.getPayload());
    }

    @Transactional
    public JsonNode saveWorkspace(UUID userId, UUID teamId, JsonNode payload) {
        if (payload == null || !payload.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid project workspace payload");
        }

        ProjectWorkspace workspace = findOrCreateWorkspace(userId, teamId);
        workspace.setPayload(writePayload(payload));
        ProjectWorkspace saved = projectWorkspaceRepository.save(workspace);
        return parsePayload(saved.getPayload());
    }

    private ProjectWorkspace findOrCreateWorkspace(UUID userId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            return projectWorkspaceRepository.findByTeamId(teamId)
                    .orElseGet(() -> {
                        ProjectWorkspace created = new ProjectWorkspace();
                        created.setId(UUID.randomUUID());
                        created.setTeamId(teamId);
                        created.setPayload(DEFAULT_PAYLOAD);
                        return projectWorkspaceRepository.save(created);
                    });
        }

        return projectWorkspaceRepository.findByUserIdAndTeamIdIsNull(userId)
                .orElseGet(() -> {
                    ProjectWorkspace created = new ProjectWorkspace();
                    created.setId(UUID.randomUUID());
                    created.setUserId(userId);
                    created.setPayload(DEFAULT_PAYLOAD);
                    return projectWorkspaceRepository.save(created);
                });
    }

    private JsonNode parsePayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid workspace payload in storage");
        }
    }

    private String writePayload(JsonNode payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not serialize project workspace payload");
        }
    }
}
