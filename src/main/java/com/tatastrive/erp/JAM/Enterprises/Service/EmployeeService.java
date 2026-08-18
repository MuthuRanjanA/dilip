package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeRequest;
import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeResponse;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;
import com.tatastrive.erp.JAM.Enterprises.dto.UpdateEmployeeRequest;

import java.util.List;

public interface EmployeeService {
    CreateEmployeeResponse createEmployee(CreateEmployeeRequest request);
    List<EmployeeDTO> getAllEmployees();
    EmployeeDTO getEmployeeById(Long id);
    EmployeeDTO getEmployeeByEmail(String email);
    List<EmployeeDTO> getTeamMembers(Long managerId);
    EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request);
    void deleteEmployee(Long id);
}
