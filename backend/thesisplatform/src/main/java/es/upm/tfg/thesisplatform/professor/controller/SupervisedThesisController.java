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

/**
 * REST controller responsible for managing supervised thesis records
 * associated with the authenticated professor.
 */
@RestController
@RequestMapping("/api/professors/me/theses")
@RequiredArgsConstructor
public class SupervisedThesisController {

    /**
     * Service layer responsible for supervised thesis business logic.
     */
    private final SupervisedThesisService supervisedThesisService;

    /**
     * Creates a new supervised thesis record for the authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @param request request DTO with thesis data
     * @return created supervised thesis response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping
    public SupervisedThesisResponse create(
            Authentication authentication,
            @Valid @RequestBody SupervisedThesisRequest request) {
        return supervisedThesisService.create(authentication.getName(), request);
    }

    /**
     * Retrieves all supervised theses of the authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @return list of supervised thesis responses
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping
    public List<SupervisedThesisResponse> getMyTheses(Authentication authentication) {
        return supervisedThesisService.getMyTheses(authentication.getName());
    }

    /**
     * Deletes one supervised thesis record owned by the authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @param id identifier of the thesis to delete
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @DeleteMapping("/{id}")
    public void delete(
            Authentication authentication,
            @PathVariable Long id) {
        supervisedThesisService.delete(authentication.getName(), id);
    }
}