package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayRollDto {
    private Long id;
    private Double basicSalary;
    private Double hra;
    private Double da;
    private Double tax;
    private Double bonus;
    private Double deduction;
    private Double allowances;
    private Double overtime;
    private Double nightShiftAllowance;
    private Double netSalary;

    private String month;
    private Integer year;
    private PayrollStatus status;
    private LocalDate paymentDate;

    private Long employeeId;
    private String employeeName;
    private String designation;
    private String departmentName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
