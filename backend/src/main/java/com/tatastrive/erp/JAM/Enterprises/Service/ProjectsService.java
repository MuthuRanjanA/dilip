package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.Projects;
import com.tatastrive.erp.JAM.Enterprises.dto.AssignEmployeeDto;
import com.tatastrive.erp.JAM.Enterprises.dto.ProjectsDto;

import java.util.List;

public interface ProjectsService {

    ProjectsDto saveProjects(ProjectsDto projectDto);

    List<ProjectsDto> getAllProjects();

    ProjectsDto getProjectsById(Long projectId);
    public ProjectsDto updateProjects(Long projectId, ProjectsDto projectDto);

    void deleteProjects(Long projectId);

    ProjectsDto assignEmployeeToProject(Long projectId, AssignEmployeeDto assignEmployeeDto);

    List<ProjectsDto> getMyProjects(String email);

}
