package com.businessshowcase.contact.dto;

import com.businessshowcase.contact.ContactSubmission;

import java.time.Instant;

/**
 * Admin view stavke - sva polja.
 */
public record ContactSubmissionDto(
        Long id,
        String name,
        String email,
        String phone,
        String topic,
        String message,
        ContactSubmission.Status status,
        Instant createdAt
) {
    public static ContactSubmissionDto from(ContactSubmission entity) {
        return new ContactSubmissionDto(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getTopic(),
                entity.getMessage(),
                entity.getStatus(),
                entity.getCreatedAt()
        );
    }
}
