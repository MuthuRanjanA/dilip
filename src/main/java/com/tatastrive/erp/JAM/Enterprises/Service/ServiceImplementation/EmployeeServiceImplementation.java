package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.EmploymentStatus;
import com.tatastrive.erp.JAM.Enterprises.EmploymentType;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.DepartmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Role;
import com.tatastrive.erp.JAM.Enterprises.Service.EmployeeService;
import com.tatastrive.erp.JAM.Enterprises.config.TemporaryPasswordGenerator;
import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeRequest;
import com.tatastrive.erp.JAM.Enterprises.dto.CreateEmployeeResponse;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;
import com.tatastrive.erp.JAM.Enterprises.dto.UpdateEmployeeRequest;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import com.tatastrive.erp.JAM.Enterprises.mapper.EmployeeMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImplementation implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;
    private final TemporaryPasswordGenerator passwordGenerator;

    @Override
    @Transactional
    public CreateEmployeeResponse createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee email already exists");
        }

        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Login account already exists with this email");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId()).orElse(null);
        }

        Employee employee = new Employee();
        employee.setEmployeeName(request.getEmployeeName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now());
        employee.setEmergencyContact(request.getEmergencyContact());
        employee.setEmploymentStatus(request.getEmploymentStatus() != null ? request.getEmploymentStatus() : EmploymentStatus.ACTIVE);
        employee.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : EmploymentType.FULL_TIME);
        employee.setDepartment(department);
        employee.setManager(manager);

        Employee savedEmployee = employeeRepository.save(employee);
        savedEmployee.setEmployeeCode("EMP-" + String.format("%04d", savedEmployee.getEmployeeId()));
        savedEmployee = employeeRepository.save(savedEmployee);

        String temporaryPassword = passwordGenerator.generate();

        AppUser appUser = new AppUser();
        appUser.setEmail(savedEmployee.getEmail());
        appUser.setPassword(passwordEncoder.encode(temporaryPassword));
        appUser.setRole(request.getRole() != null ? request.getRole() : Role.EMPLOYEE);
        appUser.setEnabled(true);
        appUser.setTemporaryPassword(true);
        appUser.setEmployee(savedEmployee);

        appUserRepository.save(appUser);

        return new CreateEmployeeResponse(
                employeeMapper.toDTO(savedEmployee),
                temporaryPassword
        );
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
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        return employeeMapper.toDTO(employee);
    }

    @Override
    public EmployeeDTO getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return employeeMapper.toDTO(employee);
    }

    @Override
    public List<EmployeeDTO> getTeamMembers(Long managerId) {
        return employeeRepository.findByManagerEmployeeId(managerId)
                .stream()
                .map(employeeMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId()).orElse(null);
        }

        existingEmployee.setEmployeeName(request.getEmployeeName());
        existingEmployee.setPhoneNumber(request.getPhoneNumber());
        existingEmployee.setDesignation(request.getDesignation());
        if (request.getSalary() != null) existingEmployee.setSalary(request.getSalary());
        if (request.getJoiningDate() != null) existingEmployee.setJoiningDate(request.getJoiningDate());
        if (request.getEmergencyContact() != null) existingEmployee.setEmergencyContact(request.getEmergencyContact());
        if (request.getEmploymentStatus() != null) existingEmployee.setEmploymentStatus(request.getEmploymentStatus());
        if (request.getEmploymentType() != null) existingEmployee.setEmploymentType(request.getEmploymentType());
        existingEmployee.setDepartment(department);
        existingEmployee.setManager(manager);

        Employee updatedEmployee = employeeRepository.save(existingEmployee);
        return employeeMapper.toDTO(updatedEmployee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        AppUser appUser = appUserRepository.findByEmail(employee.getEmail()).orElse(null);
        if (appUser != null) {
            appUserRepository.delete(appUser);
        }

        employeeRepository.delete(employee);
    }
}
