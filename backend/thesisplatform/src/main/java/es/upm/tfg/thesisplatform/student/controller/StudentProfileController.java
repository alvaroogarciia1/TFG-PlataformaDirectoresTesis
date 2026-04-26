package es.upm.tfg.thesisplatform.student.controller;

import es.upm.tfg.thesisplatform.student.dto.StudentProfileRequest;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.dto.StudentSearchRequest;
import es.upm.tfg.thesisplatform.student.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller responsible for managing student profiles.
 *
 * <p>
 * This controller provides endpoints for:
 * <ul>
 * <li>Retrieving and updating the authenticated student profile</li>
 * <li>Searching student profiles</li>
 * <li>Uploading and downloading the student CV</li>
 * <li>Initial profile setup together with CV upload</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    /**
     * Service layer responsible for student profile business logic.
     */
    private final StudentProfileService studentProfileService;

    /**
     * Retrieves the profile of the currently authenticated student.
     *
     * @param authentication authentication object containing the current user
     * @return student profile response
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public StudentProfileResponse getMyProfile(Authentication authentication) {
        return studentProfileService.getMyProfile(authentication.getName());
    }

    /**
     * Creates or updates the profile of the currently authenticated student.
     *
     * @param authentication authentication object containing the current user
     * @param request        request DTO with the new profile data
     * @return updated student profile response
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/me")
    public StudentProfileResponse upsertMyProfile(
            Authentication authentication,
            @Valid @RequestBody StudentProfileRequest request) {
        return studentProfileService.upsertMyProfile(authentication.getName(), request);
    }

    /**
     * Searches student profiles using structured filters.
     *
     * <p>
     * This endpoint is restricted to professors, who use it to manually
     * search for potential doctoral candidates.
     * </p>
     *
     * @param request request DTO containing optional filters
     * @return list of student profiles matching the search criteria
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/search")
    public List<StudentProfileResponse> search(@RequestBody StudentSearchRequest request) {
        return studentProfileService.search(request);
    }

    /**
     * Uploads or replaces the CV of the authenticated student.
     *
     * @param authentication authentication object containing the current user
     * @param file           uploaded CV file
     * @return updated student profile response
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/me/cv")
    public StudentProfileResponse uploadCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return studentProfileService.uploadCv(authentication.getName(), file);
    }

    /**
     * Searches students by their full name.
     *
     * <p>
     * This endpoint is restricted to professors and supports partial matching
     * over the student's first name and last name.
     * </p>
     *
     * @param name optional full-name fragment to search
     * @return list of matching student profiles
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/search")
    public List<StudentProfileResponse> searchByName(
            @RequestParam(required = false) String name) {
        return studentProfileService.searchByName(name);
    }

    /**
     * Downloads the CV file associated with the authenticated student.
     *
     * @param authentication authentication object containing the current user
     * @return response containing the CV as a PDF resource
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/cv/download")
    public ResponseEntity<Resource> downloadMyCv(Authentication authentication) {
        String email = authentication.getName();
        Resource file = studentProfileService.getMyCvFile(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cv.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    /**
     * Performs the initial student profile setup together with CV upload.
     *
     * <p>
     * This endpoint is intended for multipart form submissions where
     * profile data and CV file are sent together.
     * </p>
     *
     * @param request        student profile data
     * @param file           uploaded CV file
     * @param authentication authentication object containing the current user
     * @return created student profile response
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping(value = "/me/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudentProfileResponse setupProfile(
            @RequestPart("data") StudentProfileRequest request,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return studentProfileService.createProfileWithCv(email, request, file);
    }
}