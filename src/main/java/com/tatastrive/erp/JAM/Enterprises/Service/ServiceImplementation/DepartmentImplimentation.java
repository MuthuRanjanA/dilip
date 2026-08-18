package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Repository.DepartmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.DepartmentService;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentImplimentation implements DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public Department createDepartment(Department department) {
        if (department.getDepartmentCode() == null || department.getDepartmentCode().trim().isEmpty()) {
            department.setDepartmentCode(department.getDepartmentName().toUpperCase().replaceAll("[^A-Z]", ""));
        }
        return departmentRepository.save(department);
    }

    @Override
    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        existing.setDepartmentName(updated.getDepartmentName());
        if (updated.getDepartmentCode() != null) existing.setDepartmentCode(updated.getDepartmentCode());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getDepartmentHead() != null && updated.getDepartmentHead().getEmployeeId() != null) {
            Employee head = employeeRepository.findById(updated.getDepartmentHead().getEmployeeId()).orElse(null);
            existing.setDepartmentHead(head);
        }

        return departmentRepository.save(existing);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public List<Employee> getEmployeesByDepartmentId(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }
}
