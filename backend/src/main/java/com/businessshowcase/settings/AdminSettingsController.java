package com.businessshowcase.settings;

import com.businessshowcase.settings.dto.BusinessContactDto;
import com.businessshowcase.settings.dto.UpdateBusinessContactRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin upravlja kontakt podacima preko ovog endpoint-a.
 * Mapiranje na /api/v1/admin/** je u SecurityConfig (zahtjeva ROLE_ADMIN).
 */
@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Settings (admin)", description = "Admin update kontakt podataka")
public class AdminSettingsController {

    private final BusinessContactService service;

    @PutMapping
    @Operation(summary = "Ažuriraj kontakt podatke",
               description = "Polja koja proslijediš se ažuriraju. Prazna polja postaju NULL.")
    public ResponseEntity<BusinessContactDto> update(
            @Valid @RequestBody UpdateBusinessContactRequest request) {
        return ResponseEntity.ok(service.updateContact(request));
    }
}
