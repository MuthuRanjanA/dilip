package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDto {

    private Long attendanceId;
    private LocalDate date;
    private String status;
    private String checkInTime;
    private String checkOutTime;

    private Long employeeId;
    private String employeeName;
    private String designation;
    private String departmentName;
    private String workLocation;
    private String notes;
    private String workingHours;

    private Integer lateDurationMinutes;
    private Integer earlyDepartureMinutes;
    private Integer overtimeMinutes;
    private String shiftName;
    private Double nightShiftAllowanceEarned;
}