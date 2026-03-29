package es.upm.tfg.thesisplatform.thesisrequest.controller;

import es.upm.tfg.thesisplatform.thesisrequest.dto.CreateThesisRequestRequest;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ProfessorThesisRequestCreate;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import es.upm.tfg.thesisplatform.thesisrequest.service.ThesisRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller responsible for managing thesis direction requests.
 *
 * <p>This controller exposes endpoints for:
 * <ul>
 *     <li>Creating requests from students to professors</li>
 *     <li>Creating requests from professors to students</li>
 *     <li>Retrieving sent and received requests</li>
 *     <li>Accepting, rejecting and cancelling requests</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ThesisRequestController {

    /**
     * Service layer responsible for thesis request business logic.
     */
    private final ThesisRequestService thesisRequestService;

    /**
     * Creates a new thesis request initiated by a student and addressed to a professor.
     *
     * @param authentication authentication object containing the current user
     * @param request request DTO with the target professor and request content
     * @return created thesis request response
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ThesisRequestResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateThesisRequestRequest request) {
        return thesisRequestService.create(authentication.getName(), request);
    }

    /**
     * Creates a new thesis request initiated by a professor and addressed to a student.
     *
     * @param authentication authentication object containing the current user
     * @param request request DTO with the target student and request content
     * @return created thesis request response
     */
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/professor")
    public ThesisRequestResponse createFromProfessor(
            Authentication authentication,
            @Valid @RequestBody ProfessorThesisRequestCreate request) {
        return thesisRequestService.createFromProfessor(authentication.getName(), request);
    }

    /**
     * Retrieves the requests sent by the authenticated user.
     *
     * @param authentication authentication object containing the current user
     * @return list of sent thesis requests
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")
    @GetMapping("/sent")
    public List<ThesisRequestResponse> getSentRequests(Authentication authentication) {
        return thesisRequestService.getSentRequests(authentication.getName());
    }

    /**
     * Retrieves the requests received by the authenticated user.
     *
     * @param authentication authentication object containing the current user
     * @return list of received thesis requests
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")
    @GetMapping("/received")
    public List<ThesisRequestResponse> getReceivedRequests(Authentication authentication) {
        return thesisRequestService.getReceivedRequests(authentication.getName());
    }

    /**
     * Accepts a received thesis request.
     *
     * @param authentication authentication object containing the current user
     * @param id identifier of the request to accept
     * @return updated thesis request response
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")
    @PatchMapping("/{id}/accept")
    public ThesisRequestResponse acceptRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.acceptRequest(authentication.getName(), id);
    }

    /**
     * Rejects a received thesis request.
     *
     * @param authentication authentication object containing the current user
     * @param id identifier of the request to reject
     * @return updated thesis request response
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")
    @PatchMapping("/{id}/reject")
    public ThesisRequestResponse rejectRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.rejectRequest(authentication.getName(), id);
    }

    /**
     * Cancels a sent thesis request.
     *
     * @param authentication authentication object containing the current user
     * @param id identifier of the request to cancel
     * @return updated thesis request response
     */
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")
    @PatchMapping("/{id}/cancel")
    public ThesisRequestResponse cancelRequest(
            Authentication authentication,
            @PathVariable Long id) {
        return thesisRequestService.cancelRequest(authentication.getName(), id);
    }
}