package com.hardytec.venera.project.adapters.web.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ProjectListDto {
    private String id;
    private String name;
    private List<ProjectTaskCardDto> cards;
}
