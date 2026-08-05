package com.tatastrive.erp.JAM.Enterprises.Controller;

import com.tatastrive.erp.JAM.Enterprises.Entity.Projects;
import com.tatastrive.erp.JAM.Enterprises.Response.ApiResponse;
import com.tatastrive.erp.JAM.Enterprises.Service.ProjectsService;
import com.tatastrive.erp.JAM.Enterprises.dto.AssignEmployeeDto;
import com.tatastrive.erp.JAM.Enterprises.dto.ProjectsDto;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectsController {

    @Autowired
    private ProjectsService projectsService;

    @PostMapping
    public ResponseEntity<ApiResponse> saveProjects(@RequestBody ProjectsDto projectDto) {
        ProjectsDto savedProjects = projectsService.saveProjects(projectDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Project Created Successfully", savedProjects));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProjects() {
        try {
            List<ProjectsDto> projects= projectsService.getAllProjects();
            return ResponseEntity.ok(new ApiResponse("Sucess",projects));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(),null));
        }
    }

    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse> getMyProjects(Authentication authentication) {

        String email = authentication.getName();

        List<ProjectsDto> projects =
                projectsService.getMyProjects(email);

        return ResponseEntity.ok(
                new ApiResponse("Projects fetched successfully", projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProjectById(@PathVariable Long id) {
        try {
            ProjectsDto projects = projectsService.getProjectsById(id);

            return ResponseEntity.ok(
                    new ApiResponse("Project Retrieved Successfully", projects)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProjects(
            @PathVariable Long id,
            @RequestBody ProjectsDto projectDto) {

        try {

            ProjectsDto updatedProject =
                    projectsService.updateProjects(id, projectDto);

            return ResponseEntity.ok(
                    new ApiResponse(
                            "Project Updated Successfully",
                            updatedProject
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse(
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }

    @PutMapping("/{projectId}/assign")
    public ResponseEntity<ProjectsDto> assignEmployee(
            @PathVariable Long projectId,
            @RequestBody AssignEmployeeDto assignEmployeeDto
    ) {

        return ResponseEntity.ok(
                projectsService.assignEmployeeToProject(
                        projectId,
                        assignEmployeeDto
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProjects(@PathVariable Long id) {
        try {
            projectsService.deleteProjects(id);
            return ResponseEntity.ok(
                    new ApiResponse("Project Deleted Successfully", null)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }
}


