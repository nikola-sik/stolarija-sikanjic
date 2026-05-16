package com.businessshowcase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing  // Automatski popunjava createdAt/updatedAt
public class CarpentryShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarpentryShopApplication.class, args);
    }
}
