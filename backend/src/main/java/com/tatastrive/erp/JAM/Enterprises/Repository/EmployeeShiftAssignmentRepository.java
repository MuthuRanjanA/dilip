package com.tatastrive.erp.JAM.Enterprises.Repository;

import com.tatastrive.erp.JAM.Enterprises.Entity.EmployeeShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeShiftAssignmentRepository extends JpaRepository<EmployeeShiftAssignment, Long> {

    @Query("SELECT e FROM EmployeeShiftAssignment e WHERE e.employee.employeeId = :employeeId AND e.effectiveFrom <= :date AND (e.effectiveTo IS NULL OR e.effectiveTo >= :date) ORDER BY e.effectiveFrom DESC LIMIT 1")
    Optional<EmployeeShiftAssignment> findAssignmentForEmployeeOnDate(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);

    List<EmployeeShiftAssignment> findByEmployee_EmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    @Query("SELECT e FROM EmployeeShiftAssignment e WHERE e.effectiveFrom <= :date AND (e.effectiveTo IS NULL OR e.effectiveTo >= :date) ORDER BY e.effectiveFrom DESC")
    List<EmployeeShiftAssignment> findAllAssignmentsOnDate(@Param("date") LocalDate date);
}
