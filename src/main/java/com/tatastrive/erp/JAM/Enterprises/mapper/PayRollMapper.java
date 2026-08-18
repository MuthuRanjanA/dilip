package com.tatastrive.erp.JAM.Enterprises.mapper;

import com.tatastrive.erp.JAM.Enterprises.Entity.PayRoll;
import com.tatastrive.erp.JAM.Enterprises.dto.PayRollDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PayRollMapper {

    @Mapping(source = "employee.employeeId", target = "employeeId")
    @Mapping(source = "employee.employeeName", target = "employeeName")
    @Mapping(source = "employee.designation", target = "designation")
    @Mapping(source = "employee.department.departmentName", target = "departmentName")
    PayRollDto toDto(PayRoll payRoll);

    @Mapping(target = "employee", ignore = true)
    PayRoll toEntity(PayRollDto dto);
}
