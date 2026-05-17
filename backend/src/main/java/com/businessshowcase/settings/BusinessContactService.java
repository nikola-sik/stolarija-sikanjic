package com.businessshowcase.settings;

import com.businessshowcase.settings.dto.BusinessContactDto;
import com.businessshowcase.settings.dto.UpdateBusinessContactRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessContactService {

    private final BusinessContactRepository repository;

    @Transactional(readOnly = true)
    public BusinessContactDto getContact() {
        BusinessContact entity = repository.findById(BusinessContact.SINGLETON_ID)
                .orElseGet(this::createDefault);
        return BusinessContactDto.from(entity);
    }

    @Transactional
    public BusinessContactDto updateContact(UpdateBusinessContactRequest request) {
        BusinessContact entity = repository.findById(BusinessContact.SINGLETON_ID)
                .orElseGet(this::createDefault);

        // Update svako polje — prazno polje znači "očisti vrijednost"
        // (request je validiran prije ovoga, tako da vrijednosti su OK)
        entity.setPhone(nullIfBlank(request.phone()));
        entity.setEmail(nullIfBlank(request.email()));
        entity.setAddress(nullIfBlank(request.address()));
        entity.setCity(nullIfBlank(request.city()));
        entity.setWorkingHours(nullIfBlank(request.workingHours()));
        entity.setInstagramUrl(nullIfBlank(request.instagramUrl()));
        entity.setFacebookUrl(nullIfBlank(request.facebookUrl()));

        BusinessContact saved = repository.save(entity);
        log.info("Kontakt podaci ažurirani");
        return BusinessContactDto.from(saved);
    }

    /**
     * Defensive default - ako migracija nije setovala početni red.
     */
    private BusinessContact createDefault() {
        log.warn("BusinessContact singleton ne postoji - kreiram default");
        return repository.save(BusinessContact.builder()
                .id(BusinessContact.SINGLETON_ID)
                .build());
    }

    private static String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
