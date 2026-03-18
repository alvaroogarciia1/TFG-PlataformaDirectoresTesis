package es.upm.tfg.thesisplatform.thesisrequest.controller;

import es.upm.tfg.thesisplatform.thesisrequest.dto.CreateThesisRequestRequest;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import es.upm.tfg.thesisplatform.thesisrequest.service.ThesisRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ThesisRequestController {

    private final ThesisRequestService thesisRequestService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ThesisRequestResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateThesisRequestRequest request) {
        return thesisRequestService.create(authentication.getName(), request);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/sent")
    public List<ThesisRequestResponse> getSentRequests(Authentication authentication) {
        return thesisRequestService.getSentRequests(authentication.getName());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PatchMapping("/{id}/cancel")
    public ThesisRequestResponse cancelRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.cancelRequest(authentication.getName(), id);
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/received")
    public List<ThesisRequestResponse> getReceivedRequests(Authentication authentication) {
        return thesisRequestService.getReceivedRequests(authentication.getName());
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @PatchMapping("/{id}/accept")
    public ThesisRequestResponse acceptRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.acceptRequest(authentication.getName(), id);
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @PatchMapping("/{id}/reject")
    public ThesisRequestResponse rejectRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.rejectRequest(authentication.getName(), id);
    }
}