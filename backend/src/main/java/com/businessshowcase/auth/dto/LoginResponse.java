package com.businessshowcase.auth.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        AdminUserDto user
) {
    public static LoginResponse of(String token, long expiresInSeconds, AdminUserDto user) {
        return new LoginResponse(token, "Bearer", expiresInSeconds, user);
    }
}
