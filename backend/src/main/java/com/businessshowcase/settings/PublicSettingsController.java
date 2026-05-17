package com.businessshowcase.settings;

import com.businessshowcase.settings.dto.BusinessContactDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Javni endpoint - frontend (Header, Footer, Kontakt stranica) povlači
 * kontakt podatke odavde umjesto iz site.config.json.
 */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings (public)", description = "Javni pristup kontakt podacima")
public class PublicSettingsController {

    private final BusinessContactService service;

    @GetMapping
    @Operation(summary = "Tekući kontakt podaci biznisa")
    public ResponseEntity<BusinessContactDto> get() {
        return ResponseEntity.ok(service.getContact());
    }
}
