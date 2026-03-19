package com.hardytec.venera.project.application;

import com.hardytec.venera.project.adapters.persistence.ProjectWorkspaceRepository;
import com.hardytec.venera.project.adapters.web.dto.ProjectDto;
import com.hardytec.venera.project.adapters.web.dto.ProjectFolderDto;
import com.hardytec.venera.project.adapters.web.dto.ProjectListDto;
import com.hardytec.venera.project.adapters.web.dto.ProjectTaskCardDto;
import com.hardytec.venera.project.adapters.web.dto.ProjectWorkspacePayloadDto;
import com.hardytec.venera.project.domain.ProjectWorkspace;
import com.hardytec.venera.project.domain.WorkspaceFolder;
import com.hardytec.venera.project.domain.WorkspaceProject;
import com.hardytec.venera.project.domain.WorkspaceProjectCard;
import com.hardytec.venera.project.domain.WorkspaceProjectList;
import com.hardytec.venera.task.adapters.persistence.task.TaskSpringDataRepository;
import com.hardytec.venera.task.domain.TaskItem;
import com.hardytec.venera.team.application.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectWorkspaceService {

    private final ProjectWorkspaceRepository projectWorkspaceRepository;
    private final TaskSpringDataRepository taskRepository;
    private final TeamService teamService;

    public ProjectWorkspaceService(
            ProjectWorkspaceRepository projectWorkspaceRepository,
            TaskSpringDataRepository taskRepository,
            TeamService teamService) {
        this.projectWorkspaceRepository = projectWorkspaceRepository;
        this.taskRepository = taskRepository;
        this.teamService = teamService;
    }

    @Transactional
    public ProjectWorkspacePayloadDto getWorkspace(UUID userId, UUID teamId) {
        ProjectWorkspace workspace = findOrCreateWorkspace(userId, teamId);
        return ProjectWorkspace.toDto(workspace);
    }

    @Transactional
    public ProjectWorkspacePayloadDto saveWorkspace(UUID userId, UUID teamId, ProjectWorkspacePayloadDto payload) {
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid project workspace payload");
        }
        ProjectWorkspace workspace = findOrCreateWorkspace(userId, teamId);
        applyPayload(workspace, payload);
        return ProjectWorkspace.toDto(projectWorkspaceRepository.save(workspace));
    }

    private ProjectWorkspace findOrCreateWorkspace(UUID userId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            return projectWorkspaceRepository.findByTeamId(teamId)
                    .orElseGet(() -> {
                        ProjectWorkspace created = new ProjectWorkspace();
                        created.setTeamId(teamId);
                        return projectWorkspaceRepository.save(created);
                    });
        }
        return projectWorkspaceRepository.findByUserIdAndTeamIdIsNull(userId)
                .orElseGet(() -> {
                    ProjectWorkspace created = new ProjectWorkspace();
                    created.setUserId(userId);
                    return projectWorkspaceRepository.save(created);
                });
    }

    private void applyPayload(ProjectWorkspace workspace, ProjectWorkspacePayloadDto payload) {
        workspace.getFolders().clear();
        List<ProjectFolderDto> folderDtos = payload.getFolders() != null ? payload.getFolders() : List.of();
        for (int i = 0; i < folderDtos.size(); i++) {
            workspace.getFolders().add(toFolderEntity(folderDtos.get(i), i, workspace));
        }

        workspace.getProjects().clear();
        List<ProjectDto> projectDtos = payload.getProjects() != null ? payload.getProjects() : List.of();
        for (int i = 0; i < projectDtos.size(); i++) {
            workspace.getProjects().add(toProjectEntity(projectDtos.get(i), i, workspace));
        }
    }

    private WorkspaceFolder toFolderEntity(ProjectFolderDto dto, int index, ProjectWorkspace workspace) {
        WorkspaceFolder folder = new WorkspaceFolder();
        folder.setId(dto.getId());
        folder.setName(dto.getName());
        folder.setOrder(index);
        folder.setWorkspace(workspace);
        return folder;
    }

    private WorkspaceProject toProjectEntity(ProjectDto dto, int index, ProjectWorkspace workspace) {
        WorkspaceProject project = new WorkspaceProject();
        project.setId(dto.getId());
        project.setName(dto.getName() != null ? dto.getName() : "");
        project.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        project.setColor(dto.getColor() != null ? dto.getColor() : "#2563eb");
        project.setFolderId(dto.getFolderId());
        project.setOrder(index);
        project.setWorkspace(workspace);

        List<ProjectListDto> listDtos = dto.getLists() != null ? dto.getLists() : List.of();
        for (int i = 0; i < listDtos.size(); i++) {
            project.getLists().add(toListEntity(listDtos.get(i), i, project));
        }
        return project;
    }

    private WorkspaceProjectList toListEntity(ProjectListDto dto, int index, WorkspaceProject project) {
        WorkspaceProjectList list = new WorkspaceProjectList();
        list.setId(dto.getId());
        list.setName(dto.getName() != null ? dto.getName() : "");
        list.setOrder(index);
        list.setProject(project);

        List<ProjectTaskCardDto> cardDtos = dto.getCards() != null ? dto.getCards() : List.of();
        int cardOrder = 0;
        for (ProjectTaskCardDto cardDto : cardDtos) {
            toCardEntity(cardDto, cardOrder, list).ifPresent(card -> list.getCards().add(card));
            cardOrder++;
        }
        return list;
    }

    private Optional<WorkspaceProjectCard> toCardEntity(ProjectTaskCardDto dto, int index, WorkspaceProjectList list) {
        if (dto.getId() == null) return Optional.empty();
        Optional<TaskItem> taskOpt = taskRepository.findById(dto.getId());
        if (taskOpt.isEmpty()) return Optional.empty();

        TaskItem task = taskOpt.get();
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getCategory() != null) task.setCategory(dto.getCategory());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        taskRepository.save(task);

        WorkspaceProjectCard card = new WorkspaceProjectCard();
        card.setTask(task);
        card.setList(list);
        card.setOrder(index);
        card.setParentTaskId(dto.getParentTaskId());
        return Optional.of(card);
    }
}
