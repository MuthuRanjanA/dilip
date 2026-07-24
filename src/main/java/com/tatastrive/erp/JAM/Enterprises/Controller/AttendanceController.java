package com.tatastrive.erp.JAM.Enterprises.Controller;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.Service.AttendanceService;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;
    @PostMapping
    public AttendanceDto saveAttendance(@RequestBody Attendance attendance){
        return attendanceService.saveAttendance(attendance);
    }
    @GetMapping
    public List<AttendanceDto>getAllAttendance(){
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/employee/{employeeId}")
    public List<AttendanceDto> getAttendanceByEmployee(
            @PathVariable Long employeeId) {

        return attendanceService
                .getAttendanceByEmployee(employeeId);
    }
}
