package es.upm.tfg.thesisplatform.matching.controller;

import es.upm.tfg.thesisplatform.matching.dto.MatchResultResponse;
import es.upm.tfg.thesisplatform.matching.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/professors")
    public List<MatchResultResponse> matchProfessorsForStudent(Authentication authentication) {
        return matchingService.matchProfessorsForStudent(authentication.getName());
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/students")
    public List<MatchResultResponse> matchStudentsForProfessor(Authentication authentication) {
        return matchingService.matchStudentsForProfessor(authentication.getName());
    }
}