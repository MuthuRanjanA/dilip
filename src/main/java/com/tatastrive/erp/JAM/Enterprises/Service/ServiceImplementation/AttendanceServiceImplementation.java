package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.Entity.Department;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Entity.LeaveRequest;
import com.tatastrive.erp.JAM.Enterprises.EmploymentStatus;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.AttendanceRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.DepartmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.LeaveRequestRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeShiftAssignmentRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.AttendanceService;
import com.tatastrive.erp.JAM.Enterprises.WorkLocation;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDashboardDto;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;
import com.tatastrive.erp.JAM.Enterprises.dto.EmployeeAttendanceStatusDto;
import com.tatastrive.erp.JAM.Enterprises.dto.ShiftAttendanceSummaryDto;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import com.tatastrive.erp.JAM.Enterprises.mapper.AttendanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImplementation implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AppUserRepository appUserRepository;
    private final AttendanceMapper attendanceMapper;
    private final EmployeeShiftAssignmentRepository shiftAssignmentRepository;

    private AttendanceDto mapToEnrichedDto(Attendance attendance) {
        if (attendance == null) return null;
        AttendanceDto dto = attendanceMapper.toDTO(attendance);
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getEmployeeId());
            dto.setEmployeeName(attendance.getEmployee().getEmployeeName());
            dto.setDesignation(attendance.getEmployee().getDesignation());
            if (attendance.getEmployee().getDepartment() != null) {
                dto.setDepartmentName(attendance.getEmployee().getDepartment().getDepartmentName());
            }
        }
        if (attendance.getWorkLocation() != null) {
            dto.setWorkLocation(attendance.getWorkLocation().name());
        }
        dto.setNotes(attendance.getNotes());

        dto.setLateDurationMinutes(attendance.getLateDurationMinutes());
        dto.setEarlyDepartureMinutes(attendance.getEarlyDepartureMinutes());
        dto.setOvertimeMinutes(attendance.getOvertimeMinutes());
        dto.setNightShiftAllowanceEarned(attendance.getNightShiftAllowanceEarned());
        if (attendance.getShift() != null) {
            dto.setShiftName(attendance.getShift().getName());
        }

        // Calculate working hours
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
                LocalTime checkIn = LocalTime.parse(attendance.getCheckInTime(), formatter);
                LocalTime checkOut = LocalTime.parse(attendance.getCheckOutTime(), formatter);
                Duration duration = Duration.between(checkIn, checkOut);
                long hours = duration.toHours();
                long minutes = duration.toMinutesPart();
                dto.setWorkingHours(hours + "h " + minutes + "m");
            } catch (Exception e) {
                try {
                    DateTimeFormatter shortFormatter = DateTimeFormatter.ofPattern("HH:mm");
                    LocalTime checkIn = LocalTime.parse(attendance.getCheckInTime(), shortFormatter);
                    LocalTime checkOut = LocalTime.parse(attendance.getCheckOutTime(), shortFormatter);
                    Duration duration = Duration.between(checkIn, checkOut);
                    long hours = duration.toHours();
                    long minutes = duration.toMinutesPart();
                    dto.setWorkingHours(hours + "h " + minutes + "m");
                } catch (Exception ex) {
                    dto.setWorkingHours("--");
                }
            }
        } else if (attendance.getCheckInTime() != null) {
            dto.setWorkingHours("In Progress");
        } else {
            dto.setWorkingHours("--");
        }
        return dto;
    }

    @Override
    @Transactional
    public AttendanceDto saveAttendance(Attendance attendance) {
        if (attendance.getWorkLocation() == null) {
            attendance.setWorkLocation(WorkLocation.OFFICE);
        }
        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToEnrichedDto(savedAttendance);
    }

    @Override
    @Transactional
    public AttendanceDto checkIn(Long employeeId, String workLocationStr, String notes) {
        enforceSecurity(employeeId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeEmployeeIdAndDate(employeeId, today)
                .orElse(new Attendance());

        attendance.setEmployee(employee);
        attendance.setDate(today);

        String nowStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        if (attendance.getCheckInTime() == null) {
            attendance.setCheckInTime(nowStr);
        }

        // Shift logic
        var shiftAssignment = shiftAssignmentRepository.findAssignmentForEmployeeOnDate(employeeId, today);
        if (shiftAssignment.isPresent()) {
            var shift = shiftAssignment.get().getShift();
            attendance.setShift(shift);

            LocalTime checkInTime = LocalTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ofPattern("HH:mm:ss"));
            LocalTime expectedStart = shift.getStartTime();
            int grace = shift.getGracePeriodMinutes();
            
            // Check if late
            if (checkInTime.isAfter(expectedStart.plusMinutes(grace))) {
                attendance.setStatus("LATE");
                attendance.setLateDurationMinutes((int) Duration.between(expectedStart, checkInTime).toMinutes());
            } else {
                attendance.setStatus("PRESENT");
                attendance.setLateDurationMinutes(0);
            }
        } else {
            // Fallback if no shift assigned
            LocalTime nineAM = LocalTime.of(9, 30);
            if (LocalTime.now().isAfter(nineAM)) {
                attendance.setStatus("LATE");
            } else {
                attendance.setStatus("PRESENT");
            }
        }

        if (workLocationStr != null) {
            try {
                attendance.setWorkLocation(WorkLocation.valueOf(workLocationStr.toUpperCase()));
            } catch (Exception e) {
                attendance.setWorkLocation(WorkLocation.OFFICE);
            }
        }
        if (notes != null) attendance.setNotes(notes);

        Attendance saved = attendanceRepository.save(attendance);
        return mapToEnrichedDto(saved);
    }

    @Override
    @Transactional
    public AttendanceDto checkOut(Long employeeId) {
        enforceSecurity(employeeId);
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new ResourceNotFoundException("No check-in record found for today"));

        String nowStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        attendance.setCheckOutTime(nowStr);

        var shiftAssignment = shiftAssignmentRepository.findAssignmentForEmployeeOnDate(employeeId, today);
        if (shiftAssignment.isPresent()) {
            var shift = shiftAssignment.get().getShift();
            LocalTime checkIn = LocalTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ofPattern("HH:mm:ss"));
            LocalTime checkOut = LocalTime.parse(nowStr, DateTimeFormatter.ofPattern("HH:mm:ss"));
            
            // Handle overnight shifts
            long workedMinutes;
            if (checkOut.isBefore(checkIn)) {
                workedMinutes = Duration.between(checkIn, LocalTime.MAX).toMinutes() + 
                                Duration.between(LocalTime.MIN, checkOut).toMinutes() + 1;
            } else {
                workedMinutes = Duration.between(checkIn, checkOut).toMinutes();
            }

            attendance.setWorkingHours(workedMinutes / 60.0);

            long expectedMinutes = (long) (shift.getDuration() * 60);
            if (workedMinutes > expectedMinutes) {
                attendance.setOvertimeMinutes((int) (workedMinutes - expectedMinutes));
                attendance.setEarlyDepartureMinutes(0);
            } else {
                attendance.setOvertimeMinutes(0);
                attendance.setEarlyDepartureMinutes((int) (expectedMinutes - workedMinutes));
            }

            // Award Night Shift Allowance if configured and they worked a reasonable amount (e.g. > 4 hours)
            if (shift.getNightShiftAllowanceAmount() != null && shift.getNightShiftAllowanceAmount() > 0) {
                if (workedMinutes > 240) { // arbitrary threshold to prevent fraud
                    attendance.setNightShiftAllowanceEarned(shift.getNightShiftAllowanceAmount());
                } else {
                    attendance.setNightShiftAllowanceEarned(0.0);
                }
            } else {
                attendance.setNightShiftAllowanceEarned(0.0);
            }
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToEnrichedDto(saved);
    }

    @Override
    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    private void enforceSecurity(Long requestedEmployeeId) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("User not authenticated");
        }
        String email = authentication.getName();
        com.tatastrive.erp.JAM.Enterprises.Entity.AppUser appUser = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not found"));
        
        if (appUser.getRole() == com.tatastrive.erp.JAM.Enterprises.Role.EMPLOYEE) {
            if (appUser.getEmployee() == null || !appUser.getEmployee().getEmployeeId().equals(requestedEmployeeId)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access another employee's attendance");
            }
        } else if (appUser.getRole() == com.tatastrive.erp.JAM.Enterprises.Role.MANAGER) {
            boolean isManagerOf = employeeRepository.findById(requestedEmployeeId)
                    .map(e -> (e.getManager() != null && e.getManager().getEmployeeId().equals(appUser.getEmployee().getEmployeeId())))
                    .orElse(Boolean.FALSE);
            if (!isManagerOf && !appUser.getEmployee().getEmployeeId().equals(requestedEmployeeId)) {
                throw new org.springframework.security.access.AccessDeniedException("You can only access your team's attendance");
            }
        }
    }

    @Override
    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        enforceSecurity(employeeId);
        return attendanceRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getTeamAttendance(Long managerId) {
        return attendanceRepository.findByEmployeeManagerEmployeeId(managerId)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getAttendanceByMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return attendanceRepository.findByDateBetween(startDate, endDate)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getEmployeeAttendanceByMonth(Long employeeId, int year, int month) {
        enforceSecurity(employeeId);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return attendanceRepository.findByEmployeeEmployeeIdAndDateBetween(employeeId, startDate, endDate)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getTeamAttendanceByDate(Long managerId, LocalDate date) {
        return attendanceRepository.findByEmployeeManagerEmployeeIdAndDate(managerId, date)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public List<AttendanceDto> getTeamAttendanceByMonth(Long managerId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return attendanceRepository.findByEmployeeManagerEmployeeIdAndDateBetween(managerId, startDate, endDate)
                .stream()
                .map(this::mapToEnrichedDto)
                .toList();
    }

    @Override
    public AttendanceDashboardDto getDashboardMetrics() {
        LocalDate today = LocalDate.now();

        List<Employee> allEmployees = employeeRepository.findAll();
        long totalEmployees = allEmployees.size();
        long activeEmployees = allEmployees.stream().filter(e -> e.getEmploymentStatus() == null || e.getEmploymentStatus() == EmploymentStatus.ACTIVE).count();
        long inactiveEmployees = totalEmployees - activeEmployees;

        List<Attendance> todayRecords = attendanceRepository.findByDate(today);

        long presentCount = todayRecords.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        long absentCount = todayRecords.stream().filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus())).count();
        long leaveCount = todayRecords.stream().filter(a -> "LEAVE".equalsIgnoreCase(a.getStatus()) || "ON_LEAVE".equalsIgnoreCase(a.getStatus())).count();
        long lateCount = todayRecords.stream().filter(a -> "LATE".equalsIgnoreCase(a.getStatus())).count();
        long wfhCount = todayRecords.stream().filter(a -> a.getWorkLocation() == WorkLocation.WFH || "WORK_FROM_HOME".equalsIgnoreCase(a.getStatus()) || "WFH".equalsIgnoreCase(a.getStatus())).count();

        double attendancePercentage = activeEmployees > 0
                ? Math.round(((double) (presentCount + lateCount + wfhCount) / activeEmployees) * 1000.0) / 10.0
                : 0.0;

        List<Department> departments = departmentRepository.findAll();
        long totalDepartments = departments.size();
        long totalUsers = appUserRepository.count();
        long totalRoles = 4; // ADMIN, HR, MANAGER, EMPLOYEE

        List<AttendanceDashboardDto.DepartmentAttendanceStat> departmentStats = new ArrayList<>();
        for (Department dept : departments) {
            long deptTotal = allEmployees.stream().filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(dept.getId())).count();
            long deptPresent = todayRecords.stream().filter(a -> a.getEmployee() != null && a.getEmployee().getDepartment() != null && a.getEmployee().getDepartment().getId().equals(dept.getId()) && ("PRESENT".equalsIgnoreCase(a.getStatus()) || "LATE".equalsIgnoreCase(a.getStatus()))).count();
            double pct = deptTotal > 0 ? Math.round(((double) deptPresent / deptTotal) * 1000.0) / 10.0 : 0.0;
            departmentStats.add(new AttendanceDashboardDto.DepartmentAttendanceStat(dept.getId(), dept.getDepartmentName(), deptTotal, deptPresent, pct));
        }

        List<AttendanceDto> todayDtos = todayRecords.stream().map(this::mapToEnrichedDto).toList();

        // Pending Actions
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();
        long pendingLeavesCount = allLeaves.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();

        List<AttendanceDashboardDto.PendingActionDto> pendingActions = new ArrayList<>();
        allLeaves.stream()
                .filter(l -> "PENDING".equalsIgnoreCase(l.getStatus()))
                .limit(5)
                .forEach(l -> {
                    String requester = l.getEmployee() != null ? l.getEmployee().getEmployeeName() : "Employee #" + l.getId();
                    pendingActions.add(new AttendanceDashboardDto.PendingActionDto(
                            String.valueOf(l.getId()),
                            "LEAVE_REQUEST",
                            (l.getLeaveType() != null ? l.getLeaveType().name() : "Leave") + " Request",
                            requester,
                            l.getFromDate() != null ? l.getFromDate().toString() : "N/A",
                            "PENDING"
                    ));
                });

        return AttendanceDashboardDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .leaveCount(leaveCount)
                .lateCount(lateCount)
                .wfhCount(wfhCount)
                .attendancePercentage(attendancePercentage)
                .totalDepartments(totalDepartments)
                .totalUsers(totalUsers)
                .totalRoles(totalRoles)
                .pendingLeavesCount(pendingLeavesCount)
                .departmentStats(departmentStats)
                .todayAttendance(todayDtos)
                .pendingActions(pendingActions)
                .build();
    }

    @Override
    public List<EmployeeAttendanceStatusDto> getAttendanceStatusForDate(LocalDate date, Long managerId, Long employeeId) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("User not authenticated");
        }
        String email = authentication.getName();
        com.tatastrive.erp.JAM.Enterprises.Entity.AppUser appUser = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not found"));
        
        List<Employee> targetEmployees = new ArrayList<>();
        
        if (appUser.getRole() == com.tatastrive.erp.JAM.Enterprises.Role.EMPLOYEE) {
            targetEmployees.add(appUser.getEmployee());
        } else if (appUser.getRole() == com.tatastrive.erp.JAM.Enterprises.Role.MANAGER) {
            if (employeeId != null) {
                Employee emp = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
                if ((emp.getManager() != null && emp.getManager().getEmployeeId().equals(appUser.getEmployee().getEmployeeId())) || emp.getEmployeeId().equals(appUser.getEmployee().getEmployeeId())) {
                    targetEmployees.add(emp);
                } else {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied");
                }
            } else {
                targetEmployees.addAll(employeeRepository.findByManagerEmployeeId(appUser.getEmployee().getEmployeeId()));
                targetEmployees.add(appUser.getEmployee());
            }
        } else {
            // HR or ADMIN
            if (employeeId != null) {
                targetEmployees.add(employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found")));
            } else if (managerId != null) {
                targetEmployees.addAll(employeeRepository.findByManagerEmployeeId(managerId));
            } else {
                targetEmployees.addAll(employeeRepository.findAll());
            }
        }
        
        targetEmployees = targetEmployees.stream().filter(e -> e.getEmploymentStatus() == null || e.getEmploymentStatus() == EmploymentStatus.ACTIVE).toList();

        List<com.tatastrive.erp.JAM.Enterprises.Entity.EmployeeShiftAssignment> assignments = shiftAssignmentRepository.findAllAssignmentsOnDate(date);
        List<Attendance> attendances = attendanceRepository.findByDate(date);
        List<LeaveRequest> leaves = leaveRequestRepository.findApprovedLeavesForDate(date);
        
        List<EmployeeAttendanceStatusDto> dtos = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        boolean isToday = date.equals(LocalDate.now());

        for (Employee emp : targetEmployees) {
            EmployeeAttendanceStatusDto.EmployeeAttendanceStatusDtoBuilder builder = EmployeeAttendanceStatusDto.builder()
                .employeeId(emp.getEmployeeId())
                .employeeName(emp.getEmployeeName())
                .designation(emp.getDesignation());
                
            if (emp.getDepartment() != null) {
                builder.departmentName(emp.getDepartment().getDepartmentName());
            }

            com.tatastrive.erp.JAM.Enterprises.Entity.EmployeeShiftAssignment assignment = assignments.stream()
                .filter(a -> a.getEmployee().getEmployeeId().equals(emp.getEmployeeId()))
                .findFirst()
                .orElse(null);

            Attendance attendance = attendances.stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getEmployeeId().equals(emp.getEmployeeId()))
                .findFirst()
                .orElse(null);

            boolean hasLeave = leaves.stream().anyMatch(l -> l.getEmployee() != null && l.getEmployee().getEmployeeId().equals(emp.getEmployeeId()));

            String expectedIn = null;
            String expectedOut = null;
            LocalTime shiftStartTime = null;
            LocalTime shiftEndTime = null;
            boolean isNightShift = false;

            if (assignment != null && assignment.getShift() != null) {
                builder.shiftId(assignment.getShift().getId());
                builder.shiftName(assignment.getShift().getName());
                
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
                shiftStartTime = assignment.getShift().getStartTime();
                shiftEndTime = assignment.getShift().getEndTime();
                if (shiftStartTime != null && shiftEndTime != null) {
                    expectedIn = shiftStartTime.format(timeFormatter);
                    expectedOut = shiftEndTime.format(timeFormatter);
                    builder.shiftTiming(expectedIn + " - " + expectedOut);
                    builder.expectedCheckIn(expectedIn);
                    builder.expectedCheckOut(expectedOut);
                    if (shiftEndTime.isBefore(shiftStartTime)) {
                        isNightShift = true;
                    }
                }
            } else {
                builder.shiftName("Unassigned");
                builder.shiftTiming("--");
            }

            if (attendance != null) {
                builder.actualCheckIn(attendance.getCheckInTime());
                builder.actualCheckOut(attendance.getCheckOutTime());
                builder.lateDurationMinutes(attendance.getLateDurationMinutes() != null ? attendance.getLateDurationMinutes() : 0);
                builder.overtimeMinutes(attendance.getOvertimeMinutes() != null ? attendance.getOvertimeMinutes() : 0);
                
                if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
                        LocalTime cIn = LocalTime.parse(attendance.getCheckInTime(), formatter);
                        LocalTime cOut = LocalTime.parse(attendance.getCheckOutTime(), formatter);
                        Duration duration = Duration.between(cIn, cOut);
                        if (cOut.isBefore(cIn)) {
                             duration = Duration.between(cIn, LocalTime.MAX).plus(Duration.between(LocalTime.MIN, cOut)).plusMinutes(1);
                        }
                        builder.workingHours(duration.toHours() + "h " + duration.toMinutesPart() + "m");
                    } catch (Exception e) {
                        builder.workingHours("--");
                    }
                } else if (attendance.getCheckInTime() != null) {
                    builder.workingHours("In Progress");
                }
            }

            // Determine Dynamic Status
            String status = "ABSENT";
            
            if (hasLeave) {
                status = "ON_LEAVE";
            } else if (attendance != null && "PRESENT".equalsIgnoreCase(attendance.getStatus())) {
                status = "PRESENT";
                if (attendance.getCheckOutTime() == null) {
                    if (!isToday && !isNightShift) {
                        status = "MISSING_CHECK_OUT";
                    } else if (isNightShift && date.equals(LocalDate.now().minusDays(1))) {
                        // Yesterday's night shift. Shift end is today.
                        if (shiftEndTime != null && now.toLocalTime().isAfter(shiftEndTime.plusHours(2))) {
                            status = "MISSING_CHECK_OUT";
                        }
                    }
                }
            } else if (attendance != null && "LATE".equalsIgnoreCase(attendance.getStatus())) {
                status = "LATE";
                if (attendance.getCheckOutTime() == null) {
                    if (!isToday && !isNightShift) {
                        status = "MISSING_CHECK_OUT";
                    }
                }
            } else if (attendance != null && "WORK_FROM_HOME".equalsIgnoreCase(attendance.getStatus())) {
                status = "WORK_FROM_HOME";
            } else if (attendance != null && "ABSENT".equalsIgnoreCase(attendance.getStatus())) {
                 status = "ABSENT";
            } else if (attendance != null && attendance.getCheckInTime() != null) {
                 status = "PRESENT"; // Fallback
            } else {
                if (isToday) {
                    if (shiftStartTime == null) {
                        status = "NOT_STARTED";
                    } else {
                        LocalTime nowTime = now.toLocalTime();
                        if (nowTime.isBefore(shiftStartTime)) {
                            status = "NOT_STARTED";
                        } else {
                            // shift started, no check in
                            int grace = (assignment != null && assignment.getShift() != null) ? assignment.getShift().getGracePeriodMinutes() : 0;
                            if (nowTime.isBefore(shiftStartTime.plusMinutes(grace).plusMinutes(30))) { // Still acceptable to be just late
                                status = "MISSING_CHECK_IN";
                            } else {
                                if (isNightShift) {
                                    // if it's night shift and before midnight, it's missing check in
                                    status = "MISSING_CHECK_IN";
                                } else {
                                    status = "ABSENT";
                                }
                            }
                        }
                    }
                } else {
                    // Past date, no attendance, no leave
                    status = "ABSENT";
                }
            }
            
            // Check for weekend based on company policy (e.g. Saturday/Sunday)
            if ("ABSENT".equals(status) || "NOT_STARTED".equals(status)) {
                 java.time.DayOfWeek day = date.getDayOfWeek();
                 if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
                     status = "WEEKEND";
                 }
            }

            builder.currentStatus(status);
            dtos.add(builder.build());
        }
        
        return dtos;
    }

    @Override
    public List<ShiftAttendanceSummaryDto> getShiftsSummaryForDate(LocalDate date, Long managerId) {
        List<EmployeeAttendanceStatusDto> employeeStatuses = getAttendanceStatusForDate(date, managerId, null);
        
        java.util.Map<Long, ShiftAttendanceSummaryDto> summaryMap = new java.util.HashMap<>();
        
        // Add an "Unassigned" bucket
        ShiftAttendanceSummaryDto unassigned = new ShiftAttendanceSummaryDto();
        unassigned.setShiftId(-1L);
        unassigned.setShiftName("Unassigned");
        unassigned.setShiftTiming("--");
        unassigned.setEmployees(new ArrayList<>());
        summaryMap.put(-1L, unassigned);
        
        for (EmployeeAttendanceStatusDto emp : employeeStatuses) {
            Long shiftId = emp.getShiftId() != null ? emp.getShiftId() : -1L;
            ShiftAttendanceSummaryDto summary = summaryMap.computeIfAbsent(shiftId, k -> {
                ShiftAttendanceSummaryDto s = new ShiftAttendanceSummaryDto();
                s.setShiftId(k);
                s.setShiftName(emp.getShiftName());
                s.setShiftTiming(emp.getShiftTiming());
                s.setEmployees(new ArrayList<>());
                return s;
            });
            
            summary.getEmployees().add(emp);
            summary.setTotalEmployees(summary.getTotalEmployees() + 1);
            
            switch (emp.getCurrentStatus()) {
                case "PRESENT":
                    summary.setPresent(summary.getPresent() + 1);
                    break;
                case "LATE":
                    summary.setLate(summary.getLate() + 1);
                    summary.setPresent(summary.getPresent() + 1); // late is present
                    break;
                case "ABSENT":
                    summary.setAbsent(summary.getAbsent() + 1);
                    break;
                case "ON_LEAVE":
                    summary.setOnLeave(summary.getOnLeave() + 1);
                    break;
                case "WORK_FROM_HOME":
                    summary.setWfh(summary.getWfh() + 1);
                    break;
                case "MISSING_CHECK_IN":
                case "MISSING_CHECK_OUT":
                    summary.setMissingAttendance(summary.getMissingAttendance() + 1);
                    break;
            }
        }
        
        // Remove unassigned if empty
        if (unassigned.getTotalEmployees() == 0) {
            summaryMap.remove(-1L);
        }
        
        return new ArrayList<>(summaryMap.values());
    }
}