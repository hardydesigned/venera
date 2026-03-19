package com.hardytec.venera.project.adapters.web.dto;

import com.hardytec.venera.task.domain.TaskPriorityCategory;
import com.hardytec.venera.task.domain.TaskStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ProjectTaskCardDto {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriorityCategory category;
    private UUID parentTaskId;
    private int order;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
}
