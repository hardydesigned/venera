package com.hardytec.venera.project.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.hardytec.venera.project.adapters.web.dto.ProjectWorkspacePayloadDto;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "project_workspaces")
public class ProjectWorkspace {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = true)
    private UUID userId;

    @Column(nullable = true)
    private UUID teamId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "workspace")
    @OrderBy("sort_order ASC")
    private List<WorkspaceProject> projects = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "workspace")
    @OrderBy("sort_order ASC")
    private List<WorkspaceFolder> folders = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public static ProjectWorkspacePayloadDto toDto(ProjectWorkspace workspace) {
        ProjectWorkspacePayloadDto dto = new ProjectWorkspacePayloadDto();
        dto.setFolders(workspace.getFolders().stream().map(WorkspaceFolder::toFolderDto).toList());
        dto.setProjects(workspace.getProjects().stream().map(WorkspaceProject::toProjectDto).toList());
        return dto;
    }

}
