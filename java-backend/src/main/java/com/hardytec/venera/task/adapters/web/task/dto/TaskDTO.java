package com.hardytec.venera.task.adapters.web.task.dto;

import com.hardytec.venera.task.domain.TaskItem;
import java.util.UUID;
import java.time.LocalDateTime;
import com.hardytec.venera.task.domain.TaskPriorityCategory;
import com.hardytec.venera.task.domain.TaskStatus;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class TaskDTO {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private TaskPriorityCategory category;
    private TaskStatus status;

    public static TaskDTO from(TaskItem taskItem) {
        return new TaskDTO(
            taskItem.getId(),
            taskItem.getTitle(),
            taskItem.getDescription(),
            taskItem.getStartDate(),
            taskItem.getDueDate(),
            taskItem.getCategory(),
            taskItem.getStatus()
        );
    }
}
