package es.upm.tfg.thesisplatform.config.service;

import es.upm.tfg.thesisplatform.config.domain.SystemConfiguration;
import es.upm.tfg.thesisplatform.config.dto.SystemConfigurationResponse;
import es.upm.tfg.thesisplatform.config.dto.UpdateSystemConfigurationRequest;
import es.upm.tfg.thesisplatform.config.repository.SystemConfigurationRepository;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemConfigurationService {

    private final SystemConfigurationRepository repository;

    public SystemConfigurationService(SystemConfigurationRepository repository) {
        this.repository = repository;
    }

    public SystemConfigurationResponse getConfiguration() {
        SystemConfiguration config = repository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        return map(config);
    }

    @Transactional
    public SystemConfigurationResponse updateConfiguration(
            UpdateSystemConfigurationRequest request) {
        SystemConfiguration config = repository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        config.setBackendBaseUrl(request.backendBaseUrl());
        config.setFrontendBaseUrl(request.frontendBaseUrl());
        config.setResetPasswordUrl(request.resetPasswordUrl());
        config.setMailFrom(request.mailFrom());
        config.setUploadDir(request.uploadDir());
        config.setJwtExpiration(request.jwtExpiration());

        return map(config);
    }

    private SystemConfigurationResponse map(SystemConfiguration config) {
        return new SystemConfigurationResponse(
                config.getId(),
                config.getBackendBaseUrl(),
                config.getFrontendBaseUrl(),
                config.getResetPasswordUrl(),
                config.getMailFrom(),
                config.getUploadDir(),
                config.getJwtExpiration());
    }
}