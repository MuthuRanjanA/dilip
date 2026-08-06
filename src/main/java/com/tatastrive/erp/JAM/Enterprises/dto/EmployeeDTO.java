package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {

    private Long employeeId;
    private String employeeName;
    private String email;
    private String phoneNumber;
    private String designation;
    private Department department;
}