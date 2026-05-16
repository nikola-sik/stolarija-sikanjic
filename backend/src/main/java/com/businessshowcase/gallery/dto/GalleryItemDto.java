package com.businessshowcase.gallery.dto;

import com.businessshowcase.gallery.GalleryItem;

import java.time.Instant;

/**
 * Public reprezentacija stavke galerije.
 * Ne sadrži interne podatke poput {@code imageKey} (S3 ključ).
 */
public record GalleryItemDto(
        Long id,
        String title,
        String description,
        String category,
        String imageUrl,
        String thumbnailUrl,
        Integer displayOrder,
        boolean featured,
        Instant createdAt
) {
    public static GalleryItemDto from(GalleryItem entity) {
        return new GalleryItemDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getImageUrl(),
                entity.getThumbnailUrl(),
                entity.getDisplayOrder(),
                entity.isFeatured(),
                entity.getCreatedAt()
        );
    }
}
