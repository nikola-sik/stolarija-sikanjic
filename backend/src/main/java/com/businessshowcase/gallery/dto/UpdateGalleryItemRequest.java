package com.businessshowcase.gallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateGalleryItemRequest(
        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 5000)
        String description,

        @NotBlank
        @Size(max = 50)
        String category,

        @PositiveOrZero
        Integer displayOrder,

        Boolean featured
) {}
