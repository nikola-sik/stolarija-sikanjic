package com.businessshowcase.gallery;

import com.businessshowcase.gallery.dto.CreateGalleryItemRequest;
import com.businessshowcase.gallery.dto.GalleryItemDto;
import com.businessshowcase.gallery.dto.UpdateGalleryItemRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin operacije nad galerijom - zahtjevaju ROLE_ADMIN.
 * Mapiranje na /api/v1/admin/** je u SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/admin/gallery")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Gallery (admin)", description = "Admin CRUD nad galerijom")
public class AdminGalleryController {

    private final GalleryService galleryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Kreiraj novu stavku - upload slike + metadata")
    public ResponseEntity<GalleryItemDto> create(
            @RequestPart("metadata") @Valid CreateGalleryItemRequest metadata,
            @RequestPart("image") MultipartFile image) {

        GalleryItemDto created = galleryService.create(metadata, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Azuriraj metadata postojece stavke",
               description = "Slika se ne mijenja - za novu sliku obrisi pa kreiraj")
    public ResponseEntity<GalleryItemDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGalleryItemRequest request) {

        return ResponseEntity.ok(galleryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Brisi stavku galerije")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        galleryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
