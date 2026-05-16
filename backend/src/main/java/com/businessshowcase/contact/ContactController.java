package com.businessshowcase.contact;

import com.businessshowcase.contact.dto.ContactRequest;
import com.businessshowcase.contact.dto.ContactResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Javni endpoint za slanje contact upita - dostupan bez auth-a.
 */
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Tag(name = "Contact (public)", description = "Javno slanje upita")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @Operation(summary = "Posalji upit sa contact forme")
    public ResponseEntity<ContactResponse> submit(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {

        ContactResponse response = contactService.submit(request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
