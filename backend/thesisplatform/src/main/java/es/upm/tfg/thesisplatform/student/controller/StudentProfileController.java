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

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public StudentProfileResponse getMyProfile(Authentication authentication) {
        return studentProfileService.getMyProfile(authentication.getName());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/me")
    public StudentProfileResponse upsertMyProfile(
            Authentication authentication,
            @Valid @RequestBody StudentProfileRequest request) {
        return studentProfileService.upsertMyProfile(authentication.getName(), request);
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/search")
    public List<StudentProfileResponse> search(@RequestBody StudentSearchRequest request) {
        return studentProfileService.search(request);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/me/cv")
    public StudentProfileResponse uploadCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return studentProfileService.uploadCv(authentication.getName(), file);
    }

    @GetMapping("/search")
    public List<StudentProfileResponse> searchByThesisTitle(
            @RequestParam(required = false) String title) {
        return studentProfileService.searchByThesisTitle(title);
    }

    @GetMapping("/me/cv/download")
    public ResponseEntity<Resource> downloadMyCv(Authentication authentication) {
        String email = authentication.getName();
        Resource file = studentProfileService.getMyCvFile(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cv.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @PostMapping(value = "/me/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudentProfileResponse setupProfile(
            @RequestPart("data") StudentProfileRequest request,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return studentProfileService.createProfileWithCv(email, request, file);
    }
}