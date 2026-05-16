package com.businessshowcase.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI konfiguracija.
 * Dostupno na:
 *   - JSON spec:  /api/v1/api-docs
 *   - Swagger UI: /api/v1/swagger-ui (preusmjerava na swagger-ui/index.html)
 *
 * U Swagger UI klikneš "Authorize" i zalijepiš JWT iz login response-a
 * da bi mogao testirati admin endpoint-e.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearer-jwt";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Business Showcase API")
                        .description("Backend API za konfigurabilni business showcase. " +
                                "Trenutno deployovan kao Stolarska radnja Šikanjić.")
                        .version("v1")
                        .contact(new Contact().name("Šikanjić").email("info@sikanjic.ba"))
                        .license(new License().name("Proprietary")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT iz POST /api/v1/auth/login")));
    }
}
