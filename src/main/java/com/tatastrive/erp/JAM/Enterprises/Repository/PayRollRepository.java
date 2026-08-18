package com.tatastrive.erp.JAM.Enterprises.Repository;

import com.tatastrive.erp.JAM.Enterprises.Entity.PayRoll;
import com.tatastrive.erp.JAM.Enterprises.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayRollRepository extends JpaRepository<PayRoll, Long> {
    List<PayRoll> findByEmployeeEmployeeId(Long employeeId);
    List<PayRoll> findByMonthAndYear(String month, Integer year);
    List<PayRoll> findByStatus(PayrollStatus status);
    Optional<PayRoll> findByEmployeeEmployeeIdAndMonthAndYear(Long employeeId, String month, Integer year);
    boolean existsByEmployeeEmployeeIdAndMonthAndYear(Long employeeId, String month, Integer year);
}
