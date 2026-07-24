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
}