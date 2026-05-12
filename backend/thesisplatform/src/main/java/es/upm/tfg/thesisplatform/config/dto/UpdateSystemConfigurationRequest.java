package es.upm.tfg.thesisplatform.config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSystemConfigurationRequest(
                @NotBlank String backendBaseUrl,

                @NotBlank String frontendBaseUrl,

                @NotBlank String resetPasswordUrl,

                @NotBlank String mailFrom,

                @NotBlank String uploadDir,

                @NotNull Long jwtExpiration) {
}