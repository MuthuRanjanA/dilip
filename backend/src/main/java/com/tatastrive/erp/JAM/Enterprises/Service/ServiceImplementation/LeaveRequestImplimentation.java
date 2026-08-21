package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.LeaveRequest;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.LeaveRequestRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.LeaveRequestService;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestImplimentation implements LeaveRequestService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public LeaveRequest applyLeave(LeaveRequest leaveRequest) {
        if (leaveRequest.getEmployee() != null && leaveRequest.getEmployee().getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(leaveRequest.getEmployee().getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            leaveRequest.setEmployee(employee);
        }
        leaveRequest.setStatus("PENDING");
        return leaveRepository.save(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequest approveLeave(Long id, Long approverEmployeeId, String comment) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + id));

        leave.setStatus("APPROVED");
        if (comment != null && !comment.trim().isEmpty()) {
            leave.setManagerComment(comment);
        }

        if (approverEmployeeId != null) {
            Employee approver = employeeRepository.findById(approverEmployeeId).orElse(null);
            leave.setApprovedBy(approver);
        }

        return leaveRepository.save(leave);
    }

    @Override
    @Transactional
    public LeaveRequest rejectLeave(Long id, Long approverEmployeeId, String comment) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + id));

        leave.setStatus("REJECTED");
        if (comment != null && !comment.trim().isEmpty()) {
            leave.setManagerComment(comment);
        }

        if (approverEmployeeId != null) {
            Employee approver = employeeRepository.findById(approverEmployeeId).orElse(null);
            leave.setApprovedBy(approver);
        }

        return leaveRepository.save(leave);
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRepository.findAll();
    }

    @Override
    public List<LeaveRequest> getEmployeeLeaves(Long employeeId) {
        return leaveRepository.findByEmployeeEmployeeId(employeeId);
    }

    @Override
    public List<LeaveRequest> getTeamLeaves(Long managerId) {
        return leaveRepository.findByEmployeeManagerEmployeeId(managerId);
    }
}