package com.tatastrive.erp.JAM.Enterprises.Repository;


import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance,Long> {
    List<Attendance> findByEmployeeEmployeeId(Long employeeId);
}
