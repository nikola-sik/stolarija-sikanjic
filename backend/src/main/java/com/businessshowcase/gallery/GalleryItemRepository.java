package com.businessshowcase.gallery;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {

    /** Sve stavke određene kategorije, sortirano po display_order pa created_at desc. */
    List<GalleryItem> findByCategoryOrderByDisplayOrderAscCreatedAtDesc(String category);

    /** Sve istaknute stavke. */
    List<GalleryItem> findByFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc();

    /** Standardni sort za javni prikaz galerije. */
    Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "displayOrder")
            .and(Sort.by(Sort.Direction.DESC, "createdAt"));
}
