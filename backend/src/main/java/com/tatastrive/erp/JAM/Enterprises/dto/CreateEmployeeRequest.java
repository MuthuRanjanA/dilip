package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.EmploymentStatus;
import com.tatastrive.erp.JAM.Enterprises.EmploymentType;
import com.tatastrive.erp.JAM.Enterprises.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    private String employeeName;
    private String email;
    private String phoneNumber;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
    private String emergencyContact;

    private Long departmentId;
    private Long managerId;

    private EmploymentStatus employmentStatus;
    private EmploymentType employmentType;
    private Role role; // Optional role for app_user creation (default EMPLOYEE or MANAGER)
}
