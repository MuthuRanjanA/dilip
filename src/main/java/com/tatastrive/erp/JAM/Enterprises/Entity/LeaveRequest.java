package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.tatastrive.erp.JAM.Enterprises.LeaveType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;

    private LocalDate fromDate;
    private LocalDate toDate;

    private String status = "PENDING";

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType = LeaveType.CASUAL;

    private String managerComment;

    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (leaveType == null) leaveType = LeaveType.CASUAL;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}