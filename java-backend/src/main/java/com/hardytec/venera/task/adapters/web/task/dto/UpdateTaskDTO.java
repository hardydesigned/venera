package com.hardytec.venera.task.adapters.web.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import com.hardytec.venera.task.domain.TaskPriorityCategory;
import com.hardytec.venera.task.domain.TaskStatus;

import lombok.Data;

@Data
public class UpdateTaskDTO {
    @NotBlank String title;
    String description;
    LocalDate startDate;
    LocalDate dueDate;
    @NotNull TaskPriorityCategory category;
    @NotNull TaskStatus status;
}
