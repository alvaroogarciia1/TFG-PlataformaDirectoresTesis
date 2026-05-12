package es.upm.tfg.thesisplatform.config.controller;

import es.upm.tfg.thesisplatform.config.dto.SystemConfigurationResponse;
import es.upm.tfg.thesisplatform.config.dto.UpdateSystemConfigurationRequest;
import es.upm.tfg.thesisplatform.config.service.SystemConfigurationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/configuration")
public class SystemConfigurationController {

    private final SystemConfigurationService service;

    public SystemConfigurationController(SystemConfigurationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<SystemConfigurationResponse> getConfiguration() {
        return ResponseEntity.ok(service.getConfiguration());
    }

    @PutMapping
    public ResponseEntity<SystemConfigurationResponse> updateConfiguration(
            @Valid @RequestBody UpdateSystemConfigurationRequest request
    ) {
        return ResponseEntity.ok(service.updateConfiguration(request));
    }
}