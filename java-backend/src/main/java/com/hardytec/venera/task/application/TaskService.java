package com.hardytec.venera.task.application;

import org.springframework.stereotype.Service;

import com.hardytec.venera.task.adapters.web.task.dto.CreateTaskDTO;
import com.hardytec.venera.task.adapters.web.task.dto.UpdateTaskDTO;
import com.hardytec.venera.task.adapters.persistence.task.TaskSpringDataRepository;
import com.hardytec.venera.task.domain.TaskItem;
import com.hardytec.venera.task.adapters.web.task.dto.TaskDTO;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskSpringDataRepository taskRepository;

    public TaskService(TaskSpringDataRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskDTO createTask(CreateTaskDTO createTaskDTO, UUID userId) {
        TaskItem task = new TaskItem(
            UUID.randomUUID(),
            userId,
            createTaskDTO.getTitle(),
            createTaskDTO.getDescription(),
            createTaskDTO.getStartDate(),
            createTaskDTO.getDueDate(),
            createTaskDTO.getCategory(),
            createTaskDTO.getStatus()
        );

        TaskItem saved = taskRepository.save(task);
        return TaskDTO.from(saved);
    }

    public List<TaskDTO> getInboxTasks(UUID userId) {
        return taskRepository.findByUserIdAndProjectIdIsNull(userId).stream()
                .map(TaskDTO::from)
                .toList();
    }

    public List<TaskDTO> getTasksForProject(UUID userId, UUID projectId) {
        return taskRepository.findAllByUserIdAndProjectId(userId, projectId).stream()
                .map(TaskDTO::from)
                .toList();
    }
    
    public TaskDTO getTask(UUID id, UUID userId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (!task.getUserId().equals(userId)) {
            throw new TaskNotFoundException(id);
        }
        return TaskDTO.from(task);
    }

    public TaskDTO updateTask(UUID id, UpdateTaskDTO dto, UUID userId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (!task.getUserId().equals(userId)) {
            throw new TaskNotFoundException(id);
        }
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        task.setCategory(dto.getCategory());
        task.setStatus(dto.getStatus());
        TaskItem saved = taskRepository.save(task);
        return TaskDTO.from(saved);
    }

    public void deleteTask(UUID id, UUID userId) {
        TaskItem task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (!task.getUserId().equals(userId)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }
}
