package com.tatastrive.erp.JAM.Enterprises.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}