package com.hardytec.venera.task.domain;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "tasks")
public class TaskItem {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = true)
    private UUID teamId;

    @Column(nullable = true)
    private UUID projectId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private LocalDateTime startDate;

    @Column(nullable = true)
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriorityCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = true)
    private Integer estimatedDurationMinutes;

    @Column(nullable = true)
    private Integer actualDurationMinutes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (startDate != null && dueDate != null && startDate.isAfter(dueDate)) {
            throw new IllegalArgumentException("start date must be before due date");
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public TaskItem(
            UUID id,
            UUID userId,
            UUID teamId,
            String title,
            String description,
            LocalDateTime startDate,
            LocalDateTime dueDate,
            TaskPriorityCategory category,
            TaskStatus status,
            Integer estimatedDurationMinutes,
            Integer actualDurationMinutes) {
        this.id = id;
        this.userId = userId;
        this.teamId = teamId;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.category = category;
        this.status = status;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.actualDurationMinutes = actualDurationMinutes;
    }
}
