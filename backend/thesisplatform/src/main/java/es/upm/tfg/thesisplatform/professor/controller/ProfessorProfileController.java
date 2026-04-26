package es.upm.tfg.thesisplatform.professor.controller;

import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileRequest;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorSearchRequest;
import es.upm.tfg.thesisplatform.professor.service.ProfessorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller responsible for professor profile management.
 *
 * <p>
 * This controller exposes endpoints for:
 * <ul>
 * <li>Retrieving and updating the authenticated professor profile</li>
 * <li>Searching professor profiles</li>
 * <li>Uploading and downloading the professor CV</li>
 * <li>Initial profile setup together with CV upload</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorProfileController {

    /**
     * Service layer responsible for professor profile business logic.
     */
    private final ProfessorProfileService professorProfileService;

    /**
     * Retrieves the profile of the currently authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @return professor profile response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/me")
    public ProfessorProfileResponse getMyProfile(Authentication authentication) {
        return professorProfileService.getMyProfile(authentication.getName());
    }

    /**
     * Creates or updates the profile of the currently authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @param request        request DTO with the new profile data
     * @return updated professor profile response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PutMapping("/me")
    public ProfessorProfileResponse upsertMyProfile(
            Authentication authentication,
            @Valid @RequestBody ProfessorProfileRequest request) {
        return professorProfileService.upsertMyProfile(authentication.getName(), request);
    }

    /**
     * Searches professor profiles using structured filters.
     *
     * <p>
     * This endpoint is restricted to students, who use it to manually
     * search for potential thesis supervisors.
     * </p>
     *
     * @param request request DTO containing optional filters
     * @return list of professor profiles matching the search criteria
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/search")
    public List<ProfessorProfileResponse> search(@RequestBody ProfessorSearchRequest request) {
        return professorProfileService.search(request);
    }

    /**
     * Uploads or replaces the CV of the authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @param file           uploaded CV file
     * @return updated professor profile response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/me/cv")
    public ProfessorProfileResponse uploadCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return professorProfileService.uploadCv(authentication.getName(), file);
    }

    /**
     * Searches professors by their full name.
     *
     * <p>
     * This endpoint is public in the current implementation and supports
     * partial matching over first name and last name.
     * </p>
     *
     * @param name optional full-name fragment to search
     * @return list of matching professor profiles
     */
    @GetMapping("/search")
    public List<ProfessorProfileResponse> searchByName(
            @RequestParam(required = false) String name) {
        return professorProfileService.searchByName(name);
    }

    /**
     * Downloads the CV file associated with the authenticated professor.
     *
     * @param authentication authentication object containing the current user
     * @return response containing the CV as a PDF resource
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/me/cv/download")
    public ResponseEntity<Resource> downloadMyCv(Authentication authentication) {
        String email = authentication.getName();
        Resource file = professorProfileService.getMyCvFile(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cv.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    /**
     * Performs the initial professor profile setup together with CV upload.
     *
     * <p>
     * This endpoint is intended for multipart form submissions where
     * profile data and CV file are sent together.
     * </p>
     *
     * @param request        professor profile data
     * @param file           uploaded CV file
     * @param authentication authentication object containing the current user
     * @return created professor profile response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping(value = "/me/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfessorProfileResponse setupProfile(
            @RequestPart("data") ProfessorProfileRequest request,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return professorProfileService.createProfileWithCv(email, request, file);
    }
}