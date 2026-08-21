package com.tatastrive.erp.JAM.Enterprises.Repository;

import com.tatastrive.erp.JAM.Enterprises.Entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeEmployeeId(Long employeeId);
    List<LeaveRequest> findByEmployeeManagerEmployeeId(Long managerId);
    List<LeaveRequest> findByStatus(String status);
    
    @org.springframework.data.jpa.repository.Query("SELECT l FROM LeaveRequest l WHERE l.status = 'APPROVED' AND l.fromDate <= :date AND l.toDate >= :date")
    List<LeaveRequest> findApprovedLeavesForDate(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);
}
