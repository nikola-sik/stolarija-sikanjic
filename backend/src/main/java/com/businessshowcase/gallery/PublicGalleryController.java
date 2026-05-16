package com.businessshowcase.gallery;

import com.businessshowcase.gallery.dto.GalleryItemDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Javni endpoint-i za čitanje galerije - dostupni svima bez auth-a.
 */
@RestController
@RequestMapping("/api/v1/gallery")
@RequiredArgsConstructor
@Tag(name = "Gallery (public)", description = "Javni pristup galeriji - bez auth-a")
public class PublicGalleryController {

    private final GalleryService galleryService;

    @GetMapping
    @Operation(summary = "Lista stavki galerije",
               description = "Opcionalno filtriraj po kategoriji ili samo featured")
    public ResponseEntity<List<GalleryItemDto>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured) {

        if (Boolean.TRUE.equals(featured)) {
            return ResponseEntity.ok(galleryService.listFeatured());
        }
        if (category != null && !category.isBlank() && !"sve".equalsIgnoreCase(category)) {
            return ResponseEntity.ok(galleryService.listByCategory(category));
        }
        return ResponseEntity.ok(galleryService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Pojedinacna stavka galerije")
    public ResponseEntity<GalleryItemDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(galleryService.getById(id));
    }
}
