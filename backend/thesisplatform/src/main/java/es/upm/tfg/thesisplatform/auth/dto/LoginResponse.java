package es.upm.tfg.thesisplatform.auth.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO representing a generic login-related response with account information
 * and an additional descriptive message.
 *
 * <p>
 * Although the current authentication flow returns {@link AuthResponse},
 * this DTO may be useful for alternative login-related responses where a
 * textual message is needed.
 * </p>
 */
@Getter
@AllArgsConstructor
@Builder
public class LoginResponse {

    /**
     * Unique identifier of the user.
     */
    private Long id;

    /**
     * Email address associated with the account.
     */
    private String email;

    /**
     * Role assigned to the user.
     */
    private UserRole role;

    /**
     * Indicates whether the account is active.
     */
    private boolean active;

    /**
     * Informative message associated with the login result.
     */
    private String message;
}