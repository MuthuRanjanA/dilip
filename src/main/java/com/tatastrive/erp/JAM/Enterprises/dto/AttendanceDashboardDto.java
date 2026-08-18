package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDashboardDto {
    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;
    private long presentCount;
    private long absentCount;
    private long leaveCount;
    private long lateCount;
    private long wfhCount;
    private double attendancePercentage;

    private long totalDepartments;
    private long totalUsers;
    private long totalRoles;
    private long pendingLeavesCount;

    private List<DepartmentAttendanceStat> departmentStats;
    private List<AttendanceDto> todayAttendance;
    private List<PendingActionDto> pendingActions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DepartmentAttendanceStat {
        private Long departmentId;
        private String departmentName;
        private long totalEmployees;
        private long presentCount;
        private double attendancePercentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PendingActionDto {
        private String id;
        private String type; // LEAVE_REQUEST, ATTENDANCE_CORRECTION
        private String title;
        private String requesterName;
        private String date;
        private String status;
    }
}
