package com.hardytec.venera.project.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

import com.hardytec.venera.project.adapters.web.dto.ProjectListDto;

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "project")
@Entity
@Table(name = "workspace_project_lists")
public class WorkspaceProjectList {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private WorkspaceProject project;

    @Column(nullable = false)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private int order;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "list")
    @OrderBy("sort_order ASC")
    private List<WorkspaceProjectCard> cards = new ArrayList<>();

    public static ProjectListDto toListDto(WorkspaceProjectList list) {
        ProjectListDto dto = new ProjectListDto();
        dto.setId(list.getId());
        dto.setName(list.getName());
        dto.setCards(list.getCards().stream().map(WorkspaceProjectCard::toCardDto).toList());
        return dto;
    }

}
