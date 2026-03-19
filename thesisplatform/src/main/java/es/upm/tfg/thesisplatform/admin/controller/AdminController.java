package es.upm.tfg.thesisplatform.admin.controller;

import es.upm.tfg.thesisplatform.admin.dto.AdminUserDetailResponse;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSearchRequest;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSummaryResponse;
import es.upm.tfg.thesisplatform.admin.service.AdminService;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/users/search")
    public List<AdminUserSummaryResponse> searchUsers(@Valid @RequestBody AdminUserSearchRequest request) {
        return adminService.searchUsers(request);
    }

    @GetMapping("/users/{id}")
    public AdminUserDetailResponse getUserDetail(@PathVariable Long id) {
        return adminService.getUserDetail(id);
    }

    @PatchMapping("/users/{id}/activate")
    public AdminUserSummaryResponse activateUser(@PathVariable Long id) {
        return adminService.activateUser(id);
    }

    @PatchMapping("/users/{id}/deactivate")
    public AdminUserSummaryResponse deactivateUser(@PathVariable Long id) {
        return adminService.deactivateUser(id);
    }

    @GetMapping("/requests")
    public List<ThesisRequestResponse> getAllRequests() {
        return adminService.getAllRequests();
    }
}