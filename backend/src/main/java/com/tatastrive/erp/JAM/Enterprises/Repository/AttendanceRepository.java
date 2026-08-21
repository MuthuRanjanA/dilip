package com.tatastrive.erp.JAM.Enterprises.Repository;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.WorkLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeEmployeeId(Long employeeId);
    List<Attendance> findByEmployeeManagerEmployeeId(Long managerId);
    List<Attendance> findByDate(LocalDate date);
    Optional<Attendance> findByEmployeeEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeManagerEmployeeIdAndDate(Long managerId, LocalDate date);
    List<Attendance> findByEmployeeManagerEmployeeIdAndDateBetween(Long managerId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeDepartmentIdAndDate(Long departmentId, LocalDate date);

    long countByDateAndStatus(LocalDate date, String status);
    long countByDateAndWorkLocation(LocalDate date, WorkLocation workLocation);
}

