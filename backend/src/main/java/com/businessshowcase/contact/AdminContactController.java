package com.businessshowcase.contact;

import com.businessshowcase.contact.dto.ContactSubmissionDto;
import com.businessshowcase.contact.dto.UpdateStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/contact-submissions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Contact (admin)", description = "Admin pregled i upravljanje upitima")
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping
    @Operation(summary = "Lista svih upita - paginated, opciono filtrirana po statusu",
               description = "Sort format: 'polje,asc' ili 'polje,desc'. Dozvoljena polja: createdAt, status, name, email")
    public ResponseEntity<Page<ContactSubmissionDto>> list(
            @RequestParam(required = false) ContactSubmission.Status status,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<ContactSubmissionDto> page = (status == null)
                ? contactService.listAll(pageable)
                : contactService.listByStatus(status, pageable);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Promijeni status upita (READ/RESOLVED/ARCHIVED)")
    public ResponseEntity<ContactSubmissionDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {

        return ResponseEntity.ok(contactService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Brisi upit")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
