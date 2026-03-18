package es.upm.tfg.thesisplatform.professor.controller;

import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileRequest;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorSearchRequest;
import es.upm.tfg.thesisplatform.professor.service.ProfessorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorProfileController {

    private final ProfessorProfileService professorProfileService;

    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/me")
    public ProfessorProfileResponse getMyProfile(Authentication authentication) {
        return professorProfileService.getMyProfile(authentication.getName());
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @PutMapping("/me")
    public ProfessorProfileResponse upsertMyProfile(
            Authentication authentication,
            @Valid @RequestBody ProfessorProfileRequest request) {
        return professorProfileService.upsertMyProfile(authentication.getName(), request);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/search")
    public List<ProfessorProfileResponse> search(@RequestBody ProfessorSearchRequest request) {
        return professorProfileService.search(request);
    }
}