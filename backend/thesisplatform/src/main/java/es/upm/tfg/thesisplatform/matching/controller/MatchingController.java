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

/**
 * REST controller responsible for exposing automatic matching endpoints.
 *
 * <p>
 * This controller allows authenticated users to obtain affinity-based
 * recommendations according to their role in the platform:
 * </p>
 * <ul>
 * <li>Students can retrieve matching professors.</li>
 * <li>Professors can retrieve matching students.</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/matching")
public class MatchingController {

    /**
     * Service layer responsible for the matching business logic.
     */
    private final MatchingService matchingService;

    /**
     * Retrieves the list of professors that best match the authenticated student
     * profile.
     *
     * @param authentication Spring Security authentication object containing the
     *                       user identity
     * @return ordered list of matching professor results
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/professors")
    public List<MatchResultResponse> matchProfessorsForStudent(Authentication authentication) {
        return matchingService.matchProfessorsForStudent(authentication.getName());
    }

    /**
     * Retrieves the list of students that best match the authenticated professor
     * profile.
     *
     * @param authentication Spring Security authentication object containing the
     *                       user identity
     * @return ordered list of matching student results
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/students")
    public List<MatchResultResponse> matchStudentsForProfessor(Authentication authentication) {
        return matchingService.matchStudentsForProfessor(authentication.getName());
    }
}