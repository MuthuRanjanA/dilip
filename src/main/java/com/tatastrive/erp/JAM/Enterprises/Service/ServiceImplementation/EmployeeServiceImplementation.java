package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Repository.DepartmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.EmployeeService;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;
import com.tatastrive.erp.JAM.Enterprises.mapper.EmployeeMapper;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.List;
@Service

public class EmployeeServiceImplementation implements EmployeeService {

    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    DepartmentRepository departmentRepository;

    @Override
    public EmployeeDTO createEmployee(Employee employee) {
        Employee savedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDTO(savedEmployee);
    }

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toDTO)
                .toList();
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee Not Found"));
        return employeeMapper.toDTO(employee);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, Employee employee) {

        Employee existingEmployee =
               employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee Not Found"));

            existingEmployee.setEmployeeName(employee.getEmployeeName());
            existingEmployee.setEmail(employee.getEmail());
            existingEmployee.setPhoneNumber(employee.getPhoneNumber());
            existingEmployee.setDesignation(employee.getDesignation());
            existingEmployee.setSalary(employee.getSalary());
            existingEmployee.setJoiningDate(employee.getJoiningDate());
        if (employee.getDepartment() != null &&
                employee.getDepartment().getId() != null) {

            Long departmentId = employee.getDepartment().getId();

            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Department not found with id: " + departmentId
                            )
                    );

            existingEmployee.setDepartment(department);
        }
        Employee updatedEmployee = employeeRepository.save(existingEmployee);

        return employeeMapper.toDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
      Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        employeeRepository.delete(employee);

    }
}
