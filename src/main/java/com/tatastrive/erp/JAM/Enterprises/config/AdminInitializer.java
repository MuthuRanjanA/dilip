package com.tatastrive.erp.JAM.Enterprises.config;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createFirstAdmin(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@jam.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                AppUser admin = new AppUser();

                admin.setEmail(adminEmail);
                admin.setPassword(
                        passwordEncoder.encode("Admin@123")
                );
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                admin.setTemporaryPassword(false);

                userRepository.save(admin);

                System.out.println(
                        "Default admin created: " + adminEmail
                );
            }
        };
    }
}