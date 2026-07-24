package com.tatastrive.erp.JAM.Enterprises.Service;
import java.util.List;
import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;

public interface AttendanceService {
    AttendanceDto saveAttendance(Attendance attendance);

    List<AttendanceDto> getAllAttendance();

    List<AttendanceDto> getAttendanceByEmployee(Long employeeId);
}
