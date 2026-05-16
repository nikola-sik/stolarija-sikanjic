package com.businessshowcase.gallery;

import com.businessshowcase.common.exception.NotFoundException;
import com.businessshowcase.gallery.dto.CreateGalleryItemRequest;
import com.businessshowcase.gallery.dto.GalleryItemDto;
import com.businessshowcase.gallery.dto.UpdateGalleryItemRequest;
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

    private final GalleryItemRepository repository;
    private final StorageService storageService;

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
        // 1. Upload slike u storage
        StorageService.UploadedFile uploaded = storageService.upload(image, STORAGE_FOLDER);

        // 2. Sačuvaj zapis u bazu
        GalleryItem item = GalleryItem.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .imageUrl(uploaded.url())
                .imageKey(uploaded.key())
                .displayOrder(request.displayOrderOrDefault())
                .featured(request.featuredOrDefault())
                .build();

        item = repository.save(item);
        log.info("Kreirana galerija stavka [id={}] od strane admina", item.getId());

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

        // 1. Prvo storage (ako fail, DB rollback)
        storageService.delete(item.getImageKey());

        // 2. Pa baza
        repository.delete(item);
        log.info("Obrisana galerija stavka [id={}]", id);
    }
}
