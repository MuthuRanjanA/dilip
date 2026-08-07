package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {

    private String employeeName;

    private String email;

    private String phoneNumber;

    private String designation;

    private Long departmentId;
}
