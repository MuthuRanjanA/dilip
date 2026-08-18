package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.tatastrive.erp.JAM.Enterprises.WorkLocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "attendance")
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    private LocalDate date;
    private String status;
    private String checkInTime;
    private String checkOutTime;

    @Enumerated(EnumType.STRING)
    private WorkLocation workLocation = WorkLocation.OFFICE;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "shift_id")
    private Shift shift;

    private Integer lateDurationMinutes = 0;
    private Integer earlyDepartureMinutes = 0;
    private Integer overtimeMinutes = 0;
    private Double workingHours = 0.0;
    private Double nightShiftAllowanceEarned = 0.0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (workLocation == null) workLocation = WorkLocation.OFFICE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
