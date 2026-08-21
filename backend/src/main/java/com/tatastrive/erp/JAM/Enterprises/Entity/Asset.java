package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.tatastrive.erp.JAM.Enterprises.AssetCondition;
import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String assetName;
    private String assetCode;
    private String assetType;
    private String serialNumber;
    private Double purchaseCost;
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    @Enumerated(EnumType.STRING)
    private AssetCondition assetCondition = AssetCondition.EXCELLENT;

    private LocalDate assignedDate;
    private LocalDate returnDate;

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
        if (assetCondition == null) assetCondition = AssetCondition.EXCELLENT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
