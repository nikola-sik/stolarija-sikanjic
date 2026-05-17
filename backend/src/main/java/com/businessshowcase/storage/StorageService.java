package com.businessshowcase.storage;

/**
 * Apstrakcija nad storage backend-om (S3, R2, MinIO, lokalni disk...).
 * Servisi koriste ovaj interface, ne konkretan provider.
 *
 * Validacija fajlova (tip, veličina) je odgovornost pozivaoca
 * (npr. {@link ImageProcessor}). Storage je samo "raw bytes in/out".
 */
public interface StorageService {

    /**
     * Upload-uje sirove bajtove sa zadanim content-type-om.
     *
     * @param data            sadržaj fajla
     * @param contentType     MIME tip (npr. "image/jpeg")
     * @param filenameHint    sugestija imena fajla (za key generation, čitljivost)
     * @param folder          logički folder (npr. "gallery") - postaje prefix u ključu
     * @return UploadedFile sa ključem i javnim URL-om
     */
    UploadedFile uploadBytes(byte[] data, String contentType, String filenameHint, String folder);

    /**
     * Briše objekat po ključu. Idempotentno - ne baca grešku ako objekat ne postoji.
     */
    void delete(String key);

    /**
     * Inicijalizuje storage (kreira bucket ako ne postoji, postavlja policy).
     * Poziva se na startup.
     */
    void initialize();

    record UploadedFile(String key, String url) {}
}
