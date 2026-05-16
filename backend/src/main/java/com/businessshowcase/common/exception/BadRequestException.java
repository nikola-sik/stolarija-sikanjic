package com.businessshowcase.common.exception;

/**
 * Klijent je poslao zahtjev koji se ne može obraditi zbog logike domena
 * (osim validacije polja - to već hvata @Valid).
 * Mapira se u HTTP 400.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
