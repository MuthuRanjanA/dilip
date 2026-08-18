package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.LeaveRequest;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequest applyLeave(LeaveRequest leaveRequest);
    LeaveRequest approveLeave(Long id, Long approverEmployeeId, String comment);
    LeaveRequest rejectLeave(Long id, Long approverEmployeeId, String comment);
    List<LeaveRequest> getAllLeaveRequests();
    List<LeaveRequest> getEmployeeLeaves(Long employeeId);
    List<LeaveRequest> getTeamLeaves(Long managerId);
}