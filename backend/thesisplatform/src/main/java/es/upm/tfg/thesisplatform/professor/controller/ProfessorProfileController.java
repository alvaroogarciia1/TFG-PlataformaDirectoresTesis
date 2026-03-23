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

    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/me/cv")
    public ProfessorProfileResponse uploadCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return professorProfileService.uploadCv(authentication.getName(), file);
    }

    @GetMapping("/search")
    public List<ProfessorProfileResponse> searchByName(
            @RequestParam(required = false) String name) {
        return professorProfileService.searchByName(name);
    }

    @GetMapping("/me/cv/download")
    public ResponseEntity<Resource> downloadMyCv(Authentication authentication) {
        String email = authentication.getName();
        Resource file = professorProfileService.getMyCvFile(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cv.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @PostMapping(value = "/me/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfessorProfileResponse setupProfile(
            @RequestPart("data") ProfessorProfileRequest request,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return professorProfileService.createProfileWithCv(email, request, file);
    }
}