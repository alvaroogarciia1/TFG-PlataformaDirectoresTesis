package es.upm.tfg.thesisplatform.auth.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO returned after a successful authentication operation.
 *
 * <p>
 * It includes the basic account data together with the JWT token required
 * to access protected endpoints in subsequent requests.
 * </p>
 */
@Getter
@AllArgsConstructor
@Builder
public class AuthResponse {

    /**
     * Unique identifier of the authenticated user.
     */
    private Long id;

    /**
     * Email address associated with the authenticated account.
     */
    private String email;

    /**
     * Role assigned to the authenticated user.
     */
    private UserRole role;

    /**
     * Indicates whether the authenticated account is currently active.
     */
    private boolean active;

    /**
     * JWT token generated for the authenticated session.
     */
    private String token;
}