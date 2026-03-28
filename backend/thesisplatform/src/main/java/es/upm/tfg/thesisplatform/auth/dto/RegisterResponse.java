package es.upm.tfg.thesisplatform.auth.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO returned after a successful account registration.
 */
@Getter
@AllArgsConstructor
@Builder
public class RegisterResponse {

    /**
     * Unique identifier of the newly created account.
     */
    private Long id;

    /**
     * Email address associated with the created account.
     */
    private String email;

    /**
     * Role assigned to the created account.
     */
    private UserRole role;

    /**
     * Indicates whether the created account is active.
     */
    private boolean active;
}