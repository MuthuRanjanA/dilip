package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @Column(nullable = false)
    private String employeeName;

    @Column(unique = true, nullable = false)
    private String email;
    private String phoneNumber;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
@JsonIgnore
    @OneToMany(mappedBy = "employee",cascade = CascadeType.ALL,orphanRemoval = true)
     private List<Asset> assets;

}