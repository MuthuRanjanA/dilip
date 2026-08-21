package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftAttendanceSummaryDto {
    private Long shiftId;
    private String shiftName;
    private String shiftTiming;
    
    private int totalEmployees;
    private int present;
    private int late;
    private int absent;
    private int onLeave;
    private int wfh;
    private int missingAttendance;
    
    private List<EmployeeAttendanceStatusDto> employees;
}
