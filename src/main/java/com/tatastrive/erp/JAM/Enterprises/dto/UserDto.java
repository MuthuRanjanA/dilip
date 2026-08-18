package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private Role role;
    private boolean enabled;
    private boolean temporaryPassword;
    private LocalDateTime lastLogin;
    private Long employeeId;
    private String employeeName;
    private String designation;
    private String departmentName;
    private LocalDateTime createdAt;
}
