package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.Attendance;
import com.tatastrive.erp.JAM.Enterprises.Repository.AttendanceRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.AttendanceService;
import com.tatastrive.erp.JAM.Enterprises.dto.AttendanceDto;
import com.tatastrive.erp.JAM.Enterprises.mapper.AttendanceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImplementation implements AttendanceService {
    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private AttendanceMapper attendanceMapper;

    @Override
    public AttendanceDto saveAttendance(Attendance attendance){
        Attendance savedAttendance= attendanceRepository.save(attendance);
        return attendanceMapper.toDTO(savedAttendance);
    }

    @Override
    public List<AttendanceDto> getAllAttendance(){
        return attendanceRepository.findAll()
                .stream()
                .map(attendanceMapper::toDTO)
                .toList();
    }

    @Override
    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(attendanceMapper::toDTO)
                .toList();
    }

}