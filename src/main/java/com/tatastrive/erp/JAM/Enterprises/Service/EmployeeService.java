package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeRequest;
import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeResponse;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;
import com.tatastrive.erp.JAM.Enterprises.dto.UpdateEmployeeRequest;

import java.util.List;

public interface EmployeeService {

    CreateEmployeeResponse createEmployee(CreateEmployeeRequest request);
    List<EmployeeDTO> getAllEmployees();
    EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request);
    EmployeeDTO getEmployeeById(Long id);
    EmployeeDTO getEmployeeByEmail(String email);
    void deleteEmployee(Long id);
}
