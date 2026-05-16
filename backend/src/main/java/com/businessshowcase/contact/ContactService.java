package com.businessshowcase.contact;

import com.businessshowcase.common.exception.NotFoundException;
import com.businessshowcase.contact.dto.ContactRequest;
import com.businessshowcase.contact.dto.ContactResponse;
import com.businessshowcase.contact.dto.ContactSubmissionDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactSubmissionRepository repository;

    @Transactional
    public ContactResponse submit(ContactRequest request, HttpServletRequest httpRequest) {
        ContactSubmission submission = ContactSubmission.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .phone(blankToNull(request.phone()))
                .topic(blankToNull(request.topic()))
                .message(request.message().trim())
                .status(ContactSubmission.Status.NEW)
                .ipAddress(extractClientIp(httpRequest))
                .userAgent(truncate(httpRequest.getHeader("User-Agent"), 500))
                .build();

        submission = repository.save(submission);
        log.info("Novi contact upit [id={}, email={}]", submission.getId(), submission.getEmail());

        // TODO: Email notifikacija adminu - kasnije faza
        return ContactResponse.success(submission.getId());
    }

    @Transactional(readOnly = true)
    public Page<ContactSubmissionDto> listAll(Pageable pageable) {
        return repository.findAll(pageable).map(ContactSubmissionDto::from);
    }

    @Transactional(readOnly = true)
    public Page<ContactSubmissionDto> listByStatus(ContactSubmission.Status status,
                                                    Pageable pageable) {
        return repository.findByStatus(status, pageable).map(ContactSubmissionDto::from);
    }

    @Transactional
    public ContactSubmissionDto updateStatus(Long id, ContactSubmission.Status newStatus) {
        ContactSubmission submission = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Upit", id));

        submission.setStatus(newStatus);
        log.info("Status upita [id={}] promijenjen u {}", id, newStatus);
        return ContactSubmissionDto.from(submission);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Upit", id);
        }
        repository.deleteById(id);
        log.info("Obrisan upit [id={}]", id);
    }

    private String extractClientIp(HttpServletRequest request) {
        // X-Forwarded-For postavlja reverse proxy (Cloudflare, Nginx, etc.)
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static String truncate(String s, int maxLength) {
        if (s == null) return null;
        return s.length() <= maxLength ? s : s.substring(0, maxLength);
    }
}
