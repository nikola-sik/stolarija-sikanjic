package com.businessshowcase.common.exception;

/**
 * Bacati kad traženi resurs (entitet, fajl, itd.) ne postoji.
 * Mapira se u HTTP 404.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }

    public static NotFoundException of(String entityType, Object id) {
        return new NotFoundException("%s sa ID %s nije pronađen".formatted(entityType, id));
    }
}
