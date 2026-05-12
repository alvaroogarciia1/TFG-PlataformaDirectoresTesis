package es.upm.tfg.thesisplatform.config.dto;

public record SystemConfigurationResponse(
                Long id,
                String backendBaseUrl,
                String frontendBaseUrl,
                String resetPasswordUrl,
                String mailFrom,
                String uploadDir,
                Long jwtExpiration) {
}