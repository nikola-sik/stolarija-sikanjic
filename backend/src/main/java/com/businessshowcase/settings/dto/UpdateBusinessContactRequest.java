package com.businessshowcase.settings.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

/**
 * Polja su sva opciona — admin može da ostavi prazno ono što ne želi mijenjati.
 * Ali ako pošalje vrijednost, validira se.
 */
public record UpdateBusinessContactRequest(
        @Size(max = 50)
        String phone,

        @Email(message = "Email format nije ispravan")
        @Size(max = 255)
        String email,

        @Size(max = 255)
        String address,

        @Size(max = 100)
        String city,

        @Size(max = 255)
        String workingHours,

        @URL(message = "Instagram URL nije validan")
        @Size(max = 500)
        String instagramUrl,

        @URL(message = "Facebook URL nije validan")
        @Size(max = 500)
        String facebookUrl
) {}
