package com.businessshowcase.common.exception;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Standardizovan format greške koji se vraća klijentu.
 * Konzistentan kroz cijeli API.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fieldErrors
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, List.of());
    }

    public static ApiError withFieldErrors(int status, String error, String message,
                                            String path, List<FieldError> fieldErrors) {
        return new ApiError(Instant.now(), status, error, message, path, fieldErrors);
    }

    public record FieldError(String field, String message, Object rejectedValue) {
        public static FieldError from(Map.Entry<String, String> entry) {
            return new FieldError(entry.getKey(), entry.getValue(), null);
        }
    }
}
