package es.upm.tfg.thesisplatform.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestAuthController {

    @GetMapping("/api/test/protected")
    public String protectedEndpoint() {
        return "Protected endpoint accessed successfully";
    }
}