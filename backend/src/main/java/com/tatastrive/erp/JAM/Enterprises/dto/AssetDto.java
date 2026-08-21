package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class AssetDto{

        private Long assetId;
        private String assetName;
        private String assetType;
        private AssetStatus status;
        private LocalDate assignedDate;
        private Long employeeId;
        private String employeeName;
    }

