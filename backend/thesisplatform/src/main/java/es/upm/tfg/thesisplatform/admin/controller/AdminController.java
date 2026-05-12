package es.upm.tfg.thesisplatform.admin.controller;

import es.upm.tfg.thesisplatform.admin.dto.AdminUserDetailResponse;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserIdentityUpdateRequest;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSearchRequest;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSummaryResponse;
import es.upm.tfg.thesisplatform.admin.service.AdminService;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller responsible for administrative operations over platform users
 * and thesis requests.
 *
 * <p>
 * This controller exposes endpoints restricted to administrators, allowing
 * them to search users, inspect user details, activate or deactivate accounts,
 * inspect all thesis requests and delete non-admin accounts.
 * </p>
 *
 * <p>
 * All endpoints under this controller require the authenticated user to have
 * the {@code ADMIN} role.
 * </p>
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    /**
     * Service layer containing the business logic for administrative actions.
     */
    private final AdminService adminService;

    /**
     * Searches platform users according to the provided filtering criteria.
     *
     * @param request request DTO containing optional search text, role and active
     *                status filters
     * @return list of summarized user representations matching the search criteria
     */
    @PostMapping("/users/search")
    public List<AdminUserSummaryResponse> searchUsers(@Valid @RequestBody AdminUserSearchRequest request) {
        return adminService.searchUsers(request);
    }

    /**
     * Retrieves the full administrative detail of a specific user.
     *
     * @param id identifier of the user to retrieve
     * @return detailed user information, including profile data when available
     */
    @GetMapping("/users/{id}")
    public AdminUserDetailResponse getUserDetail(@PathVariable Long id) {
        return adminService.getUserDetail(id);
    }

    /**
     * Activates the account associated with the given user identifier.
     *
     * @param id identifier of the user to activate
     * @return updated summarized representation of the activated user
     */
    @PatchMapping("/users/{id}/activate")
    public AdminUserSummaryResponse activateUser(@PathVariable Long id) {
        return adminService.activateUser(id);
    }

    /**
     * Deactivates the account associated with the given user identifier.
     *
     * @param id identifier of the user to deactivate
     * @return updated summarized representation of the deactivated user
     */
    @PatchMapping("/users/{id}/deactivate")
    public AdminUserSummaryResponse deactivateUser(@PathVariable Long id) {
        return adminService.deactivateUser(id);
    }

    /**
     * Retrieves all thesis requests in the system for administrative inspection.
     *
     * @return list of thesis requests available in the platform
     */
    @GetMapping("/requests")
    public List<ThesisRequestResponse> getAllRequests() {
        return adminService.getAllRequests();
    }

    /**
     * Deletes a non-admin user and all dependent data that must be removed
     * together with the account.
     *
     * @param id identifier of the user to delete
     */
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    /**
     * Updates the full name and/or email of an account.
     * @param id identifier of the user
     * @param request request DTO
     * @return updated user
     */
    @PutMapping("/users/{id}/identity")
    public ResponseEntity<AdminUserDetailResponse> updateUserIdentity(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserIdentityUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUserIdentity(id, request));
    }
}