package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.PayrollStatus;
import com.tatastrive.erp.JAM.Enterprises.dto.PayRollDto;

import java.util.List;
import java.util.Map;

public interface PayRollService {
    PayRollDto generatePayRoll(PayRollDto payRollDto);
    List<PayRollDto> getAllPayRolls();
    PayRollDto getPayRollById(Long id);
    List<PayRollDto> getPayRollsByEmployee(Long employeeId);
    List<PayRollDto> getPayRollsByMonthAndYear(String month, Integer year);
    PayRollDto updatePayRollStatus(Long id, PayrollStatus status);
    void deletePayRoll(Long id);
    Map<String, Object> getPayrollSummary();
}
