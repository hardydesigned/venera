package com.hardytec.venera.project.domain;

import com.hardytec.venera.project.adapters.web.dto.ProjectTaskCardDto;
import com.hardytec.venera.task.domain.TaskItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"list", "task"})
@Entity
@Table(name = "workspace_project_cards")
public class WorkspaceProjectCard {

    @Id
    @Column(name = "task_id")
    private UUID taskId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "task_id")
    private TaskItem task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private WorkspaceProjectList list;

    @Column(name = "sort_order", nullable = false)
    private int order;

    @Column(name = "parent_task_id")
    private UUID parentTaskId;

    public static ProjectTaskCardDto toCardDto(WorkspaceProjectCard card) {
        TaskItem task = card.getTask();
        ProjectTaskCardDto dto = new ProjectTaskCardDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setCategory(task.getCategory());
        dto.setParentTaskId(card.getParentTaskId());
        dto.setOrder(card.getOrder());
        dto.setStartDate(task.getStartDate());
        dto.setDueDate(task.getDueDate());
        return dto;
    }

}
