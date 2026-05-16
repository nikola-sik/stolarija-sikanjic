package com.businessshowcase.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Kreira default admin korisnika ako u bazi nema nijednog.
 * Pokreće se jednom pri startup-u.
 *
 * Username i lozinka se konfigurišu kroz env varijable u produkciji.
 * Default vrijednosti vrijede SAMO za dev — promijeniti odmah u prod-u.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminUserInitializer {

    @Value("${app.admin.username:admin}")
    private String defaultUsername;

    @Value("${app.admin.password:admin123}")
    private String defaultPassword;

    @Bean
    public ApplicationRunner initializeAdmin(AdminUserRepository repository,
                                              PasswordEncoder encoder) {
        return args -> {
            if (repository.count() > 0) {
                log.info("Admin korisnik vec postoji - preskacem inicijalizaciju");
                return;
            }

            AdminUser admin = AdminUser.builder()
                    .username(defaultUsername)
                    .passwordHash(encoder.encode(defaultPassword))
                    .role(AdminUser.Role.ADMIN)
                    .enabled(true)
                    .build();

            repository.save(admin);

            log.warn("===================================================");
            log.warn("Kreiran default admin korisnik:");
            log.warn("  Username: {}", defaultUsername);
            log.warn("  Password: {}", defaultPassword);
            log.warn("PROMIJENI LOZINKU ODMAH U PRODUKCIJI!");
            log.warn("(env vars: APP_ADMIN_USERNAME, APP_ADMIN_PASSWORD)");
            log.warn("===================================================");
        };
    }
}
