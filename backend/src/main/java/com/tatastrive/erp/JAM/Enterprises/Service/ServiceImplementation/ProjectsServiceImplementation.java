package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.Projects;
import com.tatastrive.erp.JAM.Enterprises.ProjectStatus;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.ProjectsRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.ProjectsService;
import com.tatastrive.erp.JAM.Enterprises.dto.AssignEmployeeDto;
import com.tatastrive.erp.JAM.Enterprises.dto.ProjectsDto;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import com.tatastrive.erp.JAM.Enterprises.mapper.ProjectsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectsServiceImplementation implements ProjectsService {

    @Autowired
    private ProjectsMapper projectsMapper;
    @Autowired
    private ProjectsRepository projectsRepository;
    @Autowired
    private EmployeeRepository employeeRepository;


    private ProjectsDto convertToDto(Projects project) {

        ProjectsDto projectDto = projectsMapper.toDTO(project);

        Set<Long> employeeIds =
                project.getEmployees()
                        .stream()
                        .map(Employee::getEmployeeId)
                        .collect(Collectors.toSet());

        Set<String> employeeNames =
                project.getEmployees()
                        .stream()
                        .map(Employee::getEmployeeName)
                        .collect(Collectors.toSet());

        projectDto.setEmployeeIds(employeeIds);

        projectDto.setEmployeeNames(employeeNames);

        return projectDto;
    }

    @Override

    public ProjectsDto saveProjects(ProjectsDto projectDto) {

        Projects project = projectsMapper.toEntity(projectDto);

        Set<Long> employeeIds = projectDto.getEmployeeIds();

        Set<Employee> employees = new HashSet<>();

        if (
                employeeIds != null && !employeeIds.isEmpty()) {

            List<Employee> employeeList = employeeRepository.findAllById(employeeIds);

            if (
                    employeeList.size() != employeeIds.size()
            ) {
                throw new ResourceNotFoundException(
                        "One or more employees were not found"
                );
            }

            employees.addAll(employeeList);
        }

        project.setEmployees(employees);

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        Projects savedProject =
                projectsRepository.save(project);

        return convertToDto(savedProject);
    }
    @Override
    public List<ProjectsDto> getAllProjects() {

        return projectsRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public ProjectsDto getProjectsById(Long projectId) {

        Projects project = projectsRepository
                        .findById(projectId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Project not found with id: " + projectId)
                        );

        return convertToDto(project);
    }

    @Override
    public ProjectsDto updateProjects(
            Long projectId,
            ProjectsDto projectDto) {

        Projects existingProject =
                projectsRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found with id: " + projectId));

        existingProject.setProjectName(projectDto.getProjectName()
        );

        existingProject.setDescription(projectDto.getDescription()
        );

        existingProject.setStartDate(projectDto.getStartDate()
        );

        existingProject.setEndDate(projectDto.getEndDate()
        );

        existingProject.setStatus(projectDto.getStatus()
        );

        // Do not change existingProject.getEmployees()

        Projects savedProject = projectsRepository.save(existingProject);

        return convertToDto(savedProject);
    }


    @Override
    public ProjectsDto assignEmployeeToProject(
            Long projectId,
            AssignEmployeeDto assignEmployeeDto
    ) {

        Projects project = projectsRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Employee employee = employeeRepository
                .findById(assignEmployeeDto.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        project.getEmployees().add(employee);

        Projects savedProject = projectsRepository.save(project);

        return projectsMapper.toDTO(savedProject);
    }

    @Override
    public void deleteProjects(Long id) {
        Projects projects = projectsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        projectsRepository.delete(projects);
    }

    @Override
    public List<ProjectsDto> getMyProjects(String email) {

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with email: " + email)
                );

        return projectsRepository
                .findByEmployeesEmployeeId(employee.getEmployeeId())
                .stream()
                .map(this::convertToDto)
                .toList();
    }


}
