package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.Role;
import com.tatastrive.erp.JAM.Enterprises.dto.UserDto;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto updateUserRole(Long userId, Role role);
    UserDto updateUserStatus(Long userId, boolean enabled);
    void resetPassword(Long userId, String newPassword);
}
