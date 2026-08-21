package com.tatastrive.erp.JAM.Enterprises.dto;

import com.tatastrive.erp.JAM.Enterprises.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}