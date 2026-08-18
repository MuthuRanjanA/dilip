package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDashboardDto;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeAttendanceStatusDto;
import com.tatastrive.erp.JAM.Enterprises.dto.ShiftAttendanceSummaryDto;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDto saveAttendance(Attendance attendance);
    AttendanceDto checkIn(Long employeeId, String workLocation, String notes);
    AttendanceDto checkOut(Long employeeId);
    List<AttendanceDto> getAllAttendance();
    List<AttendanceDto> getAttendanceByEmployee(Long employeeId);
    List<AttendanceDto> getTeamAttendance(Long managerId);

    List<AttendanceDto> getAttendanceByDate(LocalDate date);
    List<AttendanceDto> getAttendanceByMonth(int year, int month);
    List<AttendanceDto> getEmployeeAttendanceByMonth(Long employeeId, int year, int month);
    List<AttendanceDto> getTeamAttendanceByDate(Long managerId, LocalDate date);
    List<AttendanceDto> getTeamAttendanceByMonth(Long managerId, int year, int month);

    List<EmployeeAttendanceStatusDto> getAttendanceStatusForDate(LocalDate date, Long managerId, Long employeeId);

    List<ShiftAttendanceSummaryDto> getShiftsSummaryForDate(LocalDate date, Long managerId);

    AttendanceDashboardDto getDashboardMetrics();
}

