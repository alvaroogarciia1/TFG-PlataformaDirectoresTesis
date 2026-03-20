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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}