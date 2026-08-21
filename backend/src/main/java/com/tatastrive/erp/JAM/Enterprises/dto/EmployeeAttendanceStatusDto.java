package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttendanceStatusDto {
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private String designation;
    
    // Shift details
    private Long shiftId;
    private String shiftName;
    private String shiftTiming; // e.g. "08:00 - 16:00"
    private String expectedCheckIn;
    private String expectedCheckOut;
    
    // Actual attendance
    private String actualCheckIn;
    private String actualCheckOut;
    private String workingHours;
    
    // Metrics
    private Integer lateDurationMinutes;
    private Integer overtimeMinutes;
    
    // Dynamic Status
    private String currentStatus;
}
