package com.businessshowcase.settings.dto;

import com.businessshowcase.settings.BusinessContact;

import java.time.Instant;

/**
 * Public reprezentacija kontakt podataka.
 * Vraća se na javnom GET endpoint-u (frontend i admin koriste isto).
 */
public record BusinessContactDto(
        String phone,
        String email,
        String address,
        String city,
        String workingHours,
        String instagramUrl,
        String facebookUrl,
        Instant updatedAt
) {
    public static BusinessContactDto from(BusinessContact entity) {
        return new BusinessContactDto(
                entity.getPhone(),
                entity.getEmail(),
                entity.getAddress(),
                entity.getCity(),
                entity.getWorkingHours(),
                entity.getInstagramUrl(),
                entity.getFacebookUrl(),
                entity.getUpdatedAt()
        );
    }
}
