package com.hardytec.venera.project.adapters.web.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ProjectDto {
    private String id;
    private String name;
    private String description;
    private String color;
    private String folderId;
    private List<ProjectListDto> lists;
}
