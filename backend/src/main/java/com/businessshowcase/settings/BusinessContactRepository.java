package com.businessshowcase.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessContactRepository extends JpaRepository<BusinessContact, Long> {
}
