package com.businessshowcase.gallery;

import com.businessshowcase.common.exception.NotFoundException;
import com.businessshowcase.gallery.dto.CreateGalleryItemRequest;
import com.businessshowcase.gallery.dto.GalleryItemDto;
import com.businessshowcase.gallery.dto.UpdateGalleryItemRequest;
import com.businessshowcase.storage.ImageProcessor;
import com.businessshowcase.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GalleryService {

    private static final String STORAGE_FOLDER = "gallery";
    private static final String THUMB_SUFFIX = "-thumb";

    private final GalleryItemRepository repository;
    private final StorageService storageService;
    private final ImageProcessor imageProcessor;

    @Transactional(readOnly = true)
    public List<GalleryItemDto> listAll() {
        return repository.findAll(GalleryItemRepository.DEFAULT_SORT).stream()
                .map(GalleryItemDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GalleryItemDto> listByCategory(String category) {
        return repository.findByCategoryOrderByDisplayOrderAscCreatedAtDesc(category).stream()
                .map(GalleryItemDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GalleryItemDto> listFeatured() {
        return repository.findByFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc().stream()
                .map(GalleryItemDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GalleryItemDto getById(Long id) {
        return repository.findById(id)
                .map(GalleryItemDto::from)
                .orElseThrow(() -> NotFoundException.of("Galerija", id));
    }

    @Transactional
    public GalleryItemDto create(CreateGalleryItemRequest request, MultipartFile image) {
        // 1. Procesiraj sliku: validacija + resize + thumbnail
        ImageProcessor.ProcessedImages processed = imageProcessor.process(image);

        String baseName = stripExtension(image.getOriginalFilename());
        String mainFilename = baseName + ".jpg";
        String thumbFilename = baseName + THUMB_SUFFIX + ".jpg";

        // 2. Upload glavne slike
        StorageService.UploadedFile mainFile = storageService.uploadBytes(
                processed.mainImage(), processed.contentType(), mainFilename, STORAGE_FOLDER);

        // 3. Upload thumbnail - ako fail, očisti glavnu da ne ostane orphan
        StorageService.UploadedFile thumbFile;
        try {
            thumbFile = storageService.uploadBytes(
                    processed.thumbnail(), processed.contentType(), thumbFilename, STORAGE_FOLDER);
        } catch (Exception e) {
            log.warn("Thumbnail upload failed - cleanup glavne slike: {}", mainFile.key());
            storageService.delete(mainFile.key());
            throw e;
        }

        // 4. Sačuvaj zapis sa oba URL-a
        GalleryItem item = GalleryItem.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .imageUrl(mainFile.url())
                .imageKey(mainFile.key())
                .thumbnailUrl(thumbFile.url())
                .thumbnailKey(thumbFile.key())
                .displayOrder(request.displayOrderOrDefault())
                .featured(request.featuredOrDefault())
                .build();

        item = repository.save(item);
        log.info("Kreirana galerija stavka [id={}] - main + thumb", item.getId());

        return GalleryItemDto.from(item);
    }

    @Transactional
    public GalleryItemDto update(Long id, UpdateGalleryItemRequest request) {
        GalleryItem item = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Galerija", id));

        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setCategory(request.category());
        if (request.displayOrder() != null) {
            item.setDisplayOrder(request.displayOrder());
        }
        if (request.featured() != null) {
            item.setFeatured(request.featured());
        }

        log.info("Azurirana galerija stavka [id={}]", id);
        return GalleryItemDto.from(item);
    }

    @Transactional
    public void delete(Long id) {
        GalleryItem item = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Galerija", id));

        // Storage cleanup (idempotentno - ne baca grešku)
        storageService.delete(item.getImageKey());
        if (item.getThumbnailKey() != null) {
            storageService.delete(item.getThumbnailKey());
        }

        repository.delete(item);
        log.info("Obrisana galerija stavka [id={}]", id);
    }

    private static String stripExtension(String filename) {
        if (filename == null || filename.isBlank()) return "image";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }
}
