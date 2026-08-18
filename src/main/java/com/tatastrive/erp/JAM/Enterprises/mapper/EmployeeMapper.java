package com.tatastrive.erp.JAM.Enterprises.mapper;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(source = "department", target = "department")
    @Mapping(source = "manager.employeeId", target = "managerId")
    @Mapping(source = "manager.employeeName", target = "managerName")
    EmployeeDTO toDTO(Employee employee);

    @Mapping(target = "manager", ignore = true)
    Employee toEntity(EmployeeDTO dto);
}
