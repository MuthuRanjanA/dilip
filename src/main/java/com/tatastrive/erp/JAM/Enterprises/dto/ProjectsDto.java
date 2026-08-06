package com.tatastrive.erp.JAM.Enterprises.dto;
import com.tatastrive.erp.JAM.Enterprises.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectsDto {

    private Long projectId;

    private String projectName;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private ProjectStatus status;

    private Set<Long> employeeIds;

    private Set<String> employeeNames;
}