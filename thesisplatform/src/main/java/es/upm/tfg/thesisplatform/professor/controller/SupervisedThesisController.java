package es.upm.tfg.thesisplatform.professor.controller;

import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisRequest;
import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisResponse;
import es.upm.tfg.thesisplatform.professor.service.SupervisedThesisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors/me/theses")
@RequiredArgsConstructor
public class SupervisedThesisController {

    private final SupervisedThesisService supervisedThesisService;

    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping
    public SupervisedThesisResponse create(
            Authentication authentication,
            @Valid @RequestBody SupervisedThesisRequest request) {
        return supervisedThesisService.create(authentication.getName(), request);
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping
    public List<SupervisedThesisResponse> getMyTheses(Authentication authentication) {
        return supervisedThesisService.getMyTheses(authentication.getName());
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @DeleteMapping("/{id}")
    public void delete(
            Authentication authentication,
            @PathVariable Long id) {
        supervisedThesisService.delete(authentication.getName(), id);
    }
}