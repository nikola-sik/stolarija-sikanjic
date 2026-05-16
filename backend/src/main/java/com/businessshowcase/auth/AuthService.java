package com.businessshowcase.auth;

import com.businessshowcase.auth.dto.AdminUserDto;
import com.businessshowcase.auth.dto.LoginRequest;
import com.businessshowcase.auth.dto.LoginResponse;
import com.businessshowcase.common.exception.NotFoundException;
import com.businessshowcase.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AdminUserRepository userRepository;

    /**
     * Verifikuje kredencijale i vraća JWT token.
     * Ako kredencijali nisu validni, baca BadCredentialsException
     * koji se mapira u 401 kroz GlobalExceptionHandler.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Delegiramo Spring Security authentication manager-u (koristi BCrypt provjeru)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        AdminUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> NotFoundException.of("Korisnik", request.username()));

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        log.info("Uspjesan login: {}", user.getUsername());

        return LoginResponse.of(token, jwtService.getExpirationSeconds(), AdminUserDto.from(user));
    }

    @Transactional(readOnly = true)
    public AdminUserDto getCurrentUser(String username) {
        AdminUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> NotFoundException.of("Korisnik", username));
        return AdminUserDto.from(user);
    }
}
