package es.upm.tfg.thesisplatform.admin.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO representing a summarized view of a user for administrative listings
 * and search results.
 */
@Getter
@AllArgsConstructor
@Builder
public class AdminUserSummaryResponse {

    /**
     * Unique identifier of the user account.
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
     * Indicates whether the account is currently active.
     */
    private boolean active;

    /**
     * Full name resolved from the associated student or professor profile.
     */
    private String fullName;
}