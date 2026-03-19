package com.hardytec.venera.project.domain;

import com.hardytec.venera.project.adapters.web.dto.ProjectFolderDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "workspace")
@Entity
@Table(name = "workspace_folders")
public class WorkspaceFolder {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private ProjectWorkspace workspace;

    @Column(nullable = false)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private int order;

    public static ProjectFolderDto toFolderDto(WorkspaceFolder folder) {
        ProjectFolderDto dto = new ProjectFolderDto();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setOrder(folder.getOrder());
        return dto;
    }

}
