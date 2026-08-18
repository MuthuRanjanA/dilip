package com.tatastrive.erp.JAM.Enterprises.config;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createInitialUsers(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {

        return args -> {
            try {
                jdbcTemplate.execute("DELETE FROM app_user WHERE role = 'SUPER_ADMIN'");
                System.out.println("Deleted legacy superadmin accounts via raw SQL.");
            } catch (Exception e) {
                System.out.println("No legacy superadmin found or error: " + e.getMessage());
            }

            String adminEmail = "admin@jam.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                AppUser admin = new AppUser();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                admin.setTemporaryPassword(false);
                userRepository.save(admin);
                System.out.println("Default admin created: " + adminEmail);
            }

            String hrEmail = "hr@jam.com";
            if (!userRepository.existsByEmail(hrEmail)) {
                AppUser hr = new AppUser();
                hr.setEmail(hrEmail);
                hr.setPassword(passwordEncoder.encode("Hr@123456"));
                hr.setRole(Role.HR);
                hr.setEnabled(true);
                hr.setTemporaryPassword(false);
                userRepository.save(hr);
                System.out.println("Default HR created: " + hrEmail);
            }
        };
    }
}