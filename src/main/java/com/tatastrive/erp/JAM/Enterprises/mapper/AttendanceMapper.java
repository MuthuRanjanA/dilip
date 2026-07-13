package com.tatastrive.erp.JAM.Enterprises.mapper;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(source = "employee.employeeId",
            target = "employeeId")

    @Mapping(source = "employee.employeeName",
            target = "employeeName")
    AttendanceDto toDTO(Attendance attendance);
}
