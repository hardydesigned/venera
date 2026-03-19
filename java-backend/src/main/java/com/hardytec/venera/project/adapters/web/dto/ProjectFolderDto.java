package com.hardytec.venera.project.adapters.web.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectFolderDto {
    private String id;
    private String name;
    private int order;
}
