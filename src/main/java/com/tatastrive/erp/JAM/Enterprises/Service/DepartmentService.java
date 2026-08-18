package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;

import java.util.List;

public interface DepartmentService {
    Department createDepartment(Department department);
    Department updateDepartment(Long id, Department department);
    List<Department> getAllDepartments();
    List<Employee> getEmployeesByDepartmentId(Long departmentId);
}
