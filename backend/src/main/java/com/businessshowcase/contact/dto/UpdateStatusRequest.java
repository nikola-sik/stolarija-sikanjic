package com.businessshowcase.contact.dto;

import com.businessshowcase.contact.ContactSubmission;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull ContactSubmission.Status status
) {}
