package com.businessshowcase.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Apstrakcija nad storage backend-om (S3, R2, MinIO, lokalni disk...).
 * Servisi koriste ovaj interface, ne konkretan provider.
 */
public interface StorageService {

    /**
     * Upload-uje fajl i vraća informacije o smještenom objektu.
     *
     * @param file    multipart fajl iz HTTP zahtjeva
     * @param folder  logički folder (npr. "gallery") - postaje prefix u ključu
     * @return UploadedFile sa ključem i javnim URL-om
     */
    UploadedFile upload(MultipartFile file, String folder);

    /**
     * Briše objekat po ključu.
     * Idempotentno - ne baca grešku ako objekat ne postoji.
     */
    void delete(String key);

    /**
     * Inicijalizuje storage (kreira bucket ako ne postoji).
     * Poziva se na startup.
     */
    void initialize();

    record UploadedFile(String key, String url) {}
}
