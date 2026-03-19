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

import com.hardytec.venera.project.adapters.web.dto.ProjectDto;

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "workspace")
@Entity
@Table(name = "workspace_projects")
public class WorkspaceProject {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private ProjectWorkspace workspace;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String color;

    @Column(name = "folder_id")
    private String folderId;

    @Column(name = "sort_order", nullable = false)
    private int order;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "project")
    @OrderBy("sort_order ASC")
    private List<WorkspaceProjectList> lists = new ArrayList<>();

    public static ProjectDto toProjectDto(WorkspaceProject project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setColor(project.getColor());
        dto.setFolderId(project.getFolderId());
        dto.setLists(project.getLists().stream().map(WorkspaceProjectList::toListDto).toList());
        return dto;
    }

}
