package com.hardytec.venera.task.adapters.web.task;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

import com.hardytec.venera.auth.adapters.web.CurrentUserResolver;
import com.hardytec.venera.task.application.TaskService;
import com.hardytec.venera.task.adapters.web.task.dto.TaskDTO;
import com.hardytec.venera.task.adapters.web.task.dto.CreateTaskDTO;
import com.hardytec.venera.task.adapters.web.task.dto.UpdateTaskDTO;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserResolver currentUserResolver;

    public TaskController(TaskService taskService, CurrentUserResolver currentUserResolver) {
        this.taskService = taskService;
        this.currentUserResolver = currentUserResolver;
    }
    
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody CreateTaskDTO createTaskDTO) {
        UUID userId = currentUserResolver.getCurrentUserId();
        TaskDTO createdTask = taskService.createTask(createTaskDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<TaskDTO>> getInboxTasks() {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(taskService.getInboxTasks(userId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDTO>> getTasksForProject(@PathVariable UUID projectId) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(taskService.getTasksForProject(userId, projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTask(@PathVariable UUID id) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(taskService.getTask(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable UUID id, @Valid @RequestBody UpdateTaskDTO updateTaskDTO) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTask(id, updateTaskDTO, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        UUID userId = currentUserResolver.getCurrentUserId();
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }    
}
