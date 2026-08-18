package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.EmployeeShiftAssignment;
import com.tatastrive.erp.JAM.Enterprises.Entity.Shift;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeShiftAssignmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.ShiftRepository;
import com.tatastrive.erp.JAM.Enterprises.dto.ShiftDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeShiftAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;

    public Shift createShift(ShiftDto dto) {
        Shift shift = new Shift();
        shift.setName(dto.getName());
        shift.setStartTime(LocalTime.parse(dto.getStartTime(), DateTimeFormatter.ofPattern("HH:mm:ss")));
        shift.setEndTime(LocalTime.parse(dto.getEndTime(), DateTimeFormatter.ofPattern("HH:mm:ss")));
        shift.setDuration(dto.getDuration() != null ? dto.getDuration() : 8.0);
        shift.setGracePeriodMinutes(dto.getGracePeriodMinutes() != null ? dto.getGracePeriodMinutes() : 0);
        shift.setNightShiftAllowanceAmount(dto.getNightShiftAllowanceAmount() != null ? dto.getNightShiftAllowanceAmount() : 0.0);
        shift.setActive(dto.getActive() != null ? dto.getActive() : true);
        return shiftRepository.save(shift);
    }

    public Shift updateShift(Long id, ShiftDto dto) {
        Shift shift = shiftRepository.findById(id).orElseThrow();
        shift.setName(dto.getName());
        if (dto.getStartTime() != null) shift.setStartTime(LocalTime.parse(dto.getStartTime(), DateTimeFormatter.ofPattern("HH:mm:ss")));
        if (dto.getEndTime() != null) shift.setEndTime(LocalTime.parse(dto.getEndTime(), DateTimeFormatter.ofPattern("HH:mm:ss")));
        if (dto.getDuration() != null) shift.setDuration(dto.getDuration());
        if (dto.getGracePeriodMinutes() != null) shift.setGracePeriodMinutes(dto.getGracePeriodMinutes());
        if (dto.getNightShiftAllowanceAmount() != null) shift.setNightShiftAllowanceAmount(dto.getNightShiftAllowanceAmount());
        if (dto.getActive() != null) shift.setActive(dto.getActive());
        return shiftRepository.save(shift);
    }

    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public void assignShiftToEmployee(Long employeeId, Long shiftId, LocalDate effectiveFrom, LocalDate effectiveTo) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow();
        Shift shift = shiftRepository.findById(shiftId).orElseThrow();

        EmployeeShiftAssignment assignment = new EmployeeShiftAssignment();
        assignment.setEmployee(employee);
        assignment.setShift(shift);
        assignment.setEffectiveFrom(effectiveFrom != null ? effectiveFrom : LocalDate.now());
        assignment.setEffectiveTo(effectiveTo);
        assignmentRepository.save(assignment);
    }
}
