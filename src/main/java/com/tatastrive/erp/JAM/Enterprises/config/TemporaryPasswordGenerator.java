package com.tatastrive.erp.JAM.Enterprises.config;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TemporaryPasswordGenerator {

    public String generate() {
        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8);

        return "Jam@" + randomPart;
    }
}