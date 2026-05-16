package com.businessshowcase.contact.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Ime je obavezno")
        @Size(min = 2, max = 100)
        String name,

        @NotBlank(message = "Email je obavezan")
        @Email(message = "Email format nije ispravan")
        @Size(max = 255)
        String email,

        @Size(max = 50)
        String phone,

        @Size(max = 50)
        String topic,

        @NotBlank(message = "Poruka je obavezna")
        @Size(min = 10, max = 5000)
        String message,

        @AssertTrue(message = "Morate dati pristanak da bismo vas kontaktirali")
        Boolean consent
) {}
