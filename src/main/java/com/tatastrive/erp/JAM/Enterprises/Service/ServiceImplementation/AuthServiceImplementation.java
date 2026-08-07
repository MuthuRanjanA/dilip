package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.config.JwtService;
import com.tatastrive.erp.JAM.Enterprises.dto.AuthResponse;
import com.tatastrive.erp.JAM.Enterprises.dto.ChangePasswordRequest;
import com.tatastrive.erp.JAM.Enterprises.dto.LoginRequest;
import com.tatastrive.erp.JAM.Enterprises.dto.RegisterRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImplementation {

        @Autowired
        private AppUserRepository appUserRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtService jwtService;



        public AuthResponse login(LoginRequest request) {

            AppUser user = appUserRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid Email"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid Password");
            }

            String token = jwtService.generateToken(request.getEmail());

            return new AuthResponse(token, user.getRole().name());
        }

    @Transactional
    public void changeTemporaryPassword(ChangePasswordRequest request) {

        AppUser user = appUserRepository
                        .findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isTemporaryPassword()) {
            throw new RuntimeException("Temporary password has already been changed");
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().length() < 8) {

            throw new RuntimeException(
                    "New password must contain at least 8 characters"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        user.setTemporaryPassword(false);

        appUserRepository.save(user);
    }
    }

