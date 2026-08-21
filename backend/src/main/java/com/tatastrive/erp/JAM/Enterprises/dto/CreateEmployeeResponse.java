package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeResponse {

    private EmployeeDTO employee;
    private String temporaryPassword;
}