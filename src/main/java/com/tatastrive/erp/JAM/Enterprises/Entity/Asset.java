package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String assetName;

        private String assetType;

        private AssetStatus status;

        private LocalDate assignedDate;

        @ManyToOne
        @JoinColumn(name = "employee_id")
        private Employee employee;
    }

