package com.tatastrive.erp.JAM.Enterprises.mapper;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.Projects;
import com.tatastrive.erp.JAM.Enterprises.dto.ProjectsDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectsMapper {

        @Mapping(
                target = "employeeIds",
                expression = "java(getEmployeeIds(project.getEmployees()))"
        )
        @Mapping(
                target = "employeeNames",
                expression = "java(getEmployeeNames(project.getEmployees()))"
        )
        ProjectsDto toDTO(Projects project);

        @Mapping(target = "employees", ignore = true)
        Projects toEntity(ProjectsDto projectDto);

        default Set<Long> getEmployeeIds(Set<Employee> employees) {

            if (employees == null) {
                return Set.of();
            }

            return employees.stream()
                    .map(Employee::getEmployeeId)
                    .collect(Collectors.toSet());
        }

        default Set<String> getEmployeeNames(Set<Employee> employees) {

            if (employees == null) {
                return Set.of();
            }
            return employees.stream()
                    .map(Employee::getEmployeeName)
                    .collect(Collectors.toSet());
        }
    }
