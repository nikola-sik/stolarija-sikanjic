package com.businessshowcase.common.exception;

/**
 * Greška pri radu sa storage-om (upload, brisanje, čitanje).
 * Mapira se u HTTP 500.
 */
public class StorageException extends RuntimeException {
    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }

    public StorageException(String message) {
        super(message);
    }
}
