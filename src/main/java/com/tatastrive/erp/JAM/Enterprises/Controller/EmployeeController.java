package com.tatastrive.erp.JAM.Enterprises.Controller;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;

import com.tatastrive.erp.JAM.Enterprises.Response.ApiResponse;
import com.tatastrive.erp.JAM.Enterprises.Service.EmployeeService;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/employees")
public class EmployeeController {
    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public EmployeeDTO createEmployee(@RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    @GetMapping
    public List<EmployeeDTO> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getEmployeeById(@PathVariable Long id) {
        try {
            EmployeeDTO employee = employeeService.getEmployeeById(id);

            return ResponseEntity.ok(
                    new ApiResponse("Employee Retrieved Successfully", employee)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        try {
            EmployeeDTO updatedEmployee = employeeService.updateEmployee(id, employee);

            return ResponseEntity.ok(
                    new ApiResponse("Employee Updated Successfully", updatedEmployee)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(
                    new ApiResponse("Employee Deleted Successfully", null)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }

}
