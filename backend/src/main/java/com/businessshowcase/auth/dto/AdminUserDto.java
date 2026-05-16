package com.businessshowcase.auth.dto;

import com.businessshowcase.auth.AdminUser;

/**
 * Public-facing reprezentacija admin korisnika.
 * NIKAD ne sadrži passwordHash.
 */
public record AdminUserDto(
        Long id,
        String username,
        AdminUser.Role role,
        boolean enabled
) {
    public static AdminUserDto from(AdminUser entity) {
        return new AdminUserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getRole(),
                entity.isEnabled()
        );
    }
}
