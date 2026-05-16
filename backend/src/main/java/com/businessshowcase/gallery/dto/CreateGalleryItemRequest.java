package com.businessshowcase.gallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateGalleryItemRequest(
        @NotBlank(message = "Naslov je obavezan")
        @Size(max = 200)
        String title,

        @Size(max = 5000)
        String description,

        @NotBlank(message = "Kategorija je obavezna")
        @Size(max = 50)
        String category,

        @PositiveOrZero
        Integer displayOrder,

        Boolean featured
) {
    public int displayOrderOrDefault() {
        return displayOrder == null ? 0 : displayOrder;
    }

    public boolean featuredOrDefault() {
        return Boolean.TRUE.equals(featured);
    }
}
