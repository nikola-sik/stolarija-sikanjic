package com.businessshowcase.contact.dto;

public record ContactResponse(
        Long id,
        String message
) {
    public static ContactResponse success(Long id) {
        return new ContactResponse(id, "Upit je uspješno poslat. Javit ćemo se u najkraćem roku.");
    }
}
