package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tatastrive.erp.JAM.Enterprises.EmploymentStatus;
import com.tatastrive.erp.JAM.Enterprises.EmploymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "employees")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    private String employeeCode;

    @Column(nullable = false)
    private String employeeName;

    @Column(unique = true, nullable = false)
    private String email;
    private String phoneNumber;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
    private String emergencyContact;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Asset> assets;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (employmentStatus == null) employmentStatus = EmploymentStatus.ACTIVE;
        if (employmentType == null) employmentType = EmploymentType.FULL_TIME;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}