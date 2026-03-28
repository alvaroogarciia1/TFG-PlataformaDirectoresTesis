package es.upm.tfg.thesisplatform.auth.controller;

import es.upm.tfg.thesisplatform.auth.dto.AuthResponse;
import es.upm.tfg.thesisplatform.auth.dto.LoginRequest;
import es.upm.tfg.thesisplatform.auth.dto.RegisterRequest;
import es.upm.tfg.thesisplatform.auth.dto.RegisterResponse;
import es.upm.tfg.thesisplatform.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller responsible for user authentication and self-registration.
 *
 * <p>
 * This controller exposes the public endpoints used to create new accounts
 * and authenticate existing users in the platform.
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * Service layer containing the business logic for registration and login.
     */
    private final AuthService authService;

    /**
     * Registers a new user account in the platform.
     *
     * <p>
     * Self-registration is only allowed for student and professor roles.
     * </p>
     *
     * @param request request DTO containing email, password and role
     * @return response DTO with the created account data
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Authenticates an existing user and returns an access token.
     *
     * @param request login credentials provided by the user
     * @return authentication response containing user data and JWT token
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}