package com.businessshowcase.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Username je obavezan")
        @Size(min = 3, max = 50)
        String username,

        @NotBlank(message = "Lozinka je obavezna")
        @Size(min = 8, max = 100, message = "Lozinka mora imati najmanje 8 karaktera")
        String password
) {}
