package com.hardytec.venera.project.adapters.web.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ProjectWorkspacePayloadDto {
    private List<ProjectDto> projects;
    private List<ProjectFolderDto> folders;
}
