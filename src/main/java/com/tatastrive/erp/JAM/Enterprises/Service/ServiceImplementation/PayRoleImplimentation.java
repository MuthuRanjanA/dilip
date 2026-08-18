package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.PayRoll;
import com.tatastrive.erp.JAM.Enterprises.PayrollStatus;
import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.Repository.AttendanceRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.PayRollRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.PayRollService;
import com.tatastrive.erp.JAM.Enterprises.dto.PayRollDto;
import com.tatastrive.erp.JAM.Enterprises.exception.BadRequestException;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import com.tatastrive.erp.JAM.Enterprises.mapper.PayRollMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayRoleImplimentation implements PayRollService {

    private final PayRollRepository payRollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayRollMapper payRollMapper;

    @Override
    @Transactional
    public PayRollDto generatePayRoll(PayRollDto dto) {
        if (dto.getEmployeeId() == null) {
            throw new BadRequestException("Employee ID is required for generating payroll");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.getEmployeeId()));

        if (dto.getMonth() == null || dto.getMonth().trim().isEmpty()) {
            throw new BadRequestException("Month is required");
        }
        if (dto.getYear() == null) {
            dto.setYear(LocalDate.now().getYear());
        }

        if (payRollRepository.existsByEmployeeEmployeeIdAndMonthAndYear(dto.getEmployeeId(), dto.getMonth(), dto.getYear())) {
            throw new BadRequestException("Payroll record already exists for " + employee.getEmployeeName() + " for " + dto.getMonth() + " " + dto.getYear());
        }

        double basicSalary = dto.getBasicSalary() != null ? dto.getBasicSalary() : (employee.getSalary() != null ? employee.getSalary() : 0.0);
        double hra = dto.getHra() != null ? dto.getHra() : Math.round(basicSalary * 0.20 * 100.0) / 100.0;
        double da = dto.getDa() != null ? dto.getDa() : Math.round(basicSalary * 0.10 * 100.0) / 100.0;
        double tax = dto.getTax() != null ? dto.getTax() : Math.round(basicSalary * 0.05 * 100.0) / 100.0;
        double bonus = dto.getBonus() != null ? dto.getBonus() : 0.0;
        double deduction = dto.getDeduction() != null ? dto.getDeduction() : 0.0;
        double allowances = dto.getAllowances() != null ? dto.getAllowances() : 0.0;
        double overtime = dto.getOvertime() != null ? dto.getOvertime() : 0.0;

        // Calculate Night Shift Allowance from attendance history
        int yearValue = dto.getYear();
        int monthValue = java.time.Month.valueOf(dto.getMonth().toUpperCase()).getValue();
        java.time.YearMonth yearMonth = java.time.YearMonth.of(yearValue, monthValue);
        java.time.LocalDate startDate = yearMonth.atDay(1);
        java.time.LocalDate endDate = yearMonth.atEndOfMonth();
        
        // Sum up night shift allowance earned this month
        double nightShiftAllowance = 0.0;
        try {
            List<Attendance> attendances = attendanceRepository.findByEmployeeEmployeeIdAndDateBetween(employee.getEmployeeId(), startDate, endDate);
            for (Attendance a : attendances) {
                if (a.getNightShiftAllowanceEarned() != null) {
                    nightShiftAllowance += a.getNightShiftAllowanceEarned();
                }
            }
        } catch (Exception e) {}

        double netSalary = Math.round((basicSalary + hra + da + bonus + allowances + nightShiftAllowance + overtime - tax - deduction) * 100.0) / 100.0;

        PayRoll payRoll = new PayRoll();
        payRoll.setEmployee(employee);
        payRoll.setBasicSalary(basicSalary);
        payRoll.setHra(hra);
        payRoll.setDa(da);
        payRoll.setTax(tax);
        payRoll.setBonus(bonus);
        payRoll.setDeduction(deduction);
        payRoll.setAllowances(allowances);
        payRoll.setOvertime(overtime);
        payRoll.setNightShiftAllowance(nightShiftAllowance);
        payRoll.setNetSalary(netSalary);
        payRoll.setMonth(dto.getMonth());
        payRoll.setYear(dto.getYear());
        payRoll.setStatus(dto.getStatus() != null ? dto.getStatus() : PayrollStatus.DRAFT);
        if (payRoll.getStatus() == PayrollStatus.PAID) {
            payRoll.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now());
        }

        PayRoll savedPayRoll = payRollRepository.save(payRoll);
        return payRollMapper.toDto(savedPayRoll);
    }

    @Override
    public List<PayRollDto> getAllPayRolls() {
        return payRollRepository.findAll()
                .stream()
                .map(payRollMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PayRollDto getPayRollById(Long id) {
        PayRoll payRoll = payRollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + id));
        return payRollMapper.toDto(payRoll);
    }

    @Override
    public List<PayRollDto> getPayRollsByEmployee(Long employeeId) {
        return payRollRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(payRollMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PayRollDto> getPayRollsByMonthAndYear(String month, Integer year) {
        return payRollRepository.findByMonthAndYear(month, year)
                .stream()
                .map(payRollMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayRollDto updatePayRollStatus(Long id, PayrollStatus status) {
        PayRoll payRoll = payRollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + id));

        payRoll.setStatus(status);
        if (status == PayrollStatus.PAID && payRoll.getPaymentDate() == null) {
            payRoll.setPaymentDate(LocalDate.now());
        }

        PayRoll updated = payRollRepository.save(payRoll);
        return payRollMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deletePayRoll(Long id) {
        PayRoll payRoll = payRollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + id));
        if (payRoll.getStatus() == PayrollStatus.PAID) {
            throw new BadRequestException("Paid payroll records cannot be deleted");
        }
        payRollRepository.delete(payRoll);
    }

    @Override
    public Map<String, Object> getPayrollSummary() {
        List<PayRoll> allPayrolls = payRollRepository.findAll();

        long totalCount = allPayrolls.size();
        long draftCount = allPayrolls.stream().filter(p -> p.getStatus() == PayrollStatus.DRAFT).count();
        long processedCount = allPayrolls.stream().filter(p -> p.getStatus() == PayrollStatus.PROCESSED).count();
        long paidCount = allPayrolls.stream().filter(p -> p.getStatus() == PayrollStatus.PAID).count();

        double totalNetDisbursed = allPayrolls.stream()
                .filter(p -> p.getStatus() == PayrollStatus.PAID && p.getNetSalary() != null)
                .mapToDouble(PayRoll::getNetSalary)
                .sum();

        double totalNetPending = allPayrolls.stream()
                .filter(p -> p.getStatus() != PayrollStatus.PAID && p.getNetSalary() != null)
                .mapToDouble(PayRoll::getNetSalary)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPayrolls", totalCount);
        summary.put("draftCount", draftCount);
        summary.put("processedCount", processedCount);
        summary.put("paidCount", paidCount);
        summary.put("totalDisbursed", Math.round(totalNetDisbursed * 100.0) / 100.0);
        summary.put("totalPending", Math.round(totalNetPending * 100.0) / 100.0);

        return summary;
    }
}
