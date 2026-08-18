package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShiftDto {
    private Long id;
    private String name;
    private String startTime;
    private String endTime;
    private Double duration;
    private Integer gracePeriodMinutes;
    private Double nightShiftAllowanceAmount;
    private Boolean active;
}
