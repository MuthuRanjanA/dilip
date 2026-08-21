package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.EmploymentStatus;
import com.tatastrive.erp.JAM.Enterprises.EmploymentType;
import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String email;
    private String phoneNumber;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
    private String emergencyContact;
    private EmploymentStatus employmentStatus;
    private EmploymentType employmentType;

    private Department department;

    private Long managerId;
    private String managerName;
}