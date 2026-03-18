package com.hardytec.venera.task.application;

import com.hardytec.venera.task.adapters.persistence.task.TaskSpringDataRepository;
import com.hardytec.venera.task.adapters.web.task.dto.CreateTaskDTO;
import com.hardytec.venera.task.adapters.web.task.dto.TaskDTO;
import com.hardytec.venera.task.adapters.web.task.dto.UpdateTaskDTO;
import com.hardytec.venera.task.domain.TaskItem;
import com.hardytec.venera.team.application.TeamService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskSpringDataRepository taskRepository;
    private final TeamService teamService;

    public TaskService(TaskSpringDataRepository taskRepository, TeamService teamService) {
        this.taskRepository = taskRepository;
        this.teamService = teamService;
    }

    public TaskDTO createTask(CreateTaskDTO createTaskDTO, UUID userId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
        }

        TaskItem task = new TaskItem(
                UUID.randomUUID(),
                userId,
                teamId,
                createTaskDTO.getTitle(),
                createTaskDTO.getDescription(),
                createTaskDTO.getStartDate(),
                createTaskDTO.getDueDate(),
                createTaskDTO.getCategory(),
                createTaskDTO.getStatus(),
                createTaskDTO.getEstimatedDurationMinutes(),
                createTaskDTO.getActualDurationMinutes());

        TaskItem saved = taskRepository.save(task);
        return TaskDTO.from(saved);
    }

    public List<TaskDTO> getInboxTasks(UUID userId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            return taskRepository.findByTeamIdAndProjectIdIsNull(teamId).stream()
                    .map(TaskDTO::from)
                    .toList();
        }

        return taskRepository.findByUserIdAndTeamIdIsNullAndProjectIdIsNull(userId).stream()
                .map(TaskDTO::from)
                .toList();
    }

    public List<TaskDTO> getTasksForProject(UUID userId, UUID projectId, UUID teamId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            return taskRepository.findAllByTeamIdAndProjectId(teamId, projectId).stream()
                    .map(TaskDTO::from)
                    .toList();
        }

        return taskRepository.findAllByUserIdAndTeamIdIsNullAndProjectId(userId, projectId).stream()
                .map(TaskDTO::from)
                .toList();
    }

    public TaskDTO getTask(UUID id, UUID userId, UUID teamId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        ensureTaskAccessible(task, userId, teamId, id);
        return TaskDTO.from(task);
    }

    public TaskDTO updateTask(UUID id, UpdateTaskDTO dto, UUID userId, UUID teamId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        ensureTaskAccessible(task, userId, teamId, id);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        task.setCategory(dto.getCategory());
        task.setStatus(dto.getStatus());
        task.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        task.setActualDurationMinutes(dto.getActualDurationMinutes());
        TaskItem saved = taskRepository.save(task);
        return TaskDTO.from(saved);
    }

    public void deleteTask(UUID id, UUID userId, UUID teamId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        ensureTaskAccessible(task, userId, teamId, id);
        taskRepository.deleteById(id);
    }

    private void ensureTaskAccessible(TaskItem task, UUID userId, UUID teamId, UUID taskId) {
        if (teamId != null) {
            teamService.assertTeamMember(teamId, userId);
            if (task.getTeamId() == null || !teamId.equals(task.getTeamId())) {
                throw new TaskNotFoundException(taskId);
            }
            return;
        }

        if (task.getTeamId() != null || !task.getUserId().equals(userId)) {
            throw new TaskNotFoundException(taskId);
        }
    }
}
