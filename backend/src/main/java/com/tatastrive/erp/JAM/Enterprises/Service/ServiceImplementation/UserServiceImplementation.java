package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Role;
import com.tatastrive.erp.JAM.Enterprises.Service.UserService;
import com.tatastrive.erp.JAM.Enterprises.dto.UserDto;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long userId, Role role) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setRole(role);
        AppUser saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(Long userId, boolean enabled) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setEnabled(enabled);
        AppUser saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTemporaryPassword(true);
        userRepository.save(user);
    }

    private UserDto mapToUserDto(AppUser user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .temporaryPassword(user.isTemporaryPassword())
                .lastLogin(user.getLastLogin())
                .employeeId(user.getEmployee() != null ? user.getEmployee().getEmployeeId() : null)
                .employeeName(user.getEmployee() != null ? user.getEmployee().getEmployeeName() : null)
                .designation(user.getEmployee() != null ? user.getEmployee().getDesignation() : null)
                .departmentName(user.getEmployee() != null && user.getEmployee().getDepartment() != null ? user.getEmployee().getDepartment().getDepartmentName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
