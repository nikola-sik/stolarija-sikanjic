package com.businessshowcase;

import com.businessshowcase.auth.dto.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.businessshowcase.storage.StorageService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test - pokreće cijeli Spring kontekst sa H2 in-memory bazom (test profil).
 * Verifikuje:
 *   - Javni endpoint-i rade bez auth
 *   - Login sa default admin kredencijalima vraća JWT
 *   - Admin endpoint-i odbijaju zahtjev bez tokena (401)
 *   - Contact endpoint validira input
 *
 * Storage je mock-ovan jer ne želimo da test zahtjeva MinIO.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GalleryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StorageService storageService;

    @Test
    void publicGalleryEndpoint_returnsEmptyListInitially() throws Exception {
        mockMvc.perform(get("/api/v1/gallery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void adminEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/contact-submissions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withDefaultCredentials_returnsJwt() throws Exception {
        LoginRequest request = new LoginRequest("admin", "admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        LoginRequest request = new LoginRequest("admin", "wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void contactSubmission_withInvalidEmail_returns400WithFieldErrors() throws Exception {
        String invalidJson = """
                {
                    "name": "Marko",
                    "email": "not-an-email",
                    "message": "Test poruka koja je dovoljno duga",
                    "consent": true
                }
                """;

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void contactSubmission_withValidData_succeeds() throws Exception {
        String validJson = """
                {
                    "name": "Marko Marković",
                    "email": "marko@example.com",
                    "phone": "+387 61 000 000",
                    "topic": "kuhinje",
                    "message": "Zanima me ponuda za kuhinju.",
                    "consent": true
                }
                """;

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
