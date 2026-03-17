package es.upm.tfg.thesisplatform.student.controller;

import es.upm.tfg.thesisplatform.student.dto.StudentProfileRequest;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/me")
    public StudentProfileResponse getMyProfile(Authentication authentication) {
        return studentProfileService.getMyProfile(authentication.getName());
    }

    @PutMapping("/me")
    public StudentProfileResponse upsertMyProfile(
            Authentication authentication,
            @Valid @RequestBody StudentProfileRequest request) {
        return studentProfileService.upsertMyProfile(authentication.getName(), request);
    }
}