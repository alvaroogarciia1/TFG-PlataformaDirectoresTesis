package es.upm.tfg.thesisplatform.admin.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used by administrators to search and filter users in the platform.
 *
 * <p>
 * All fields are optional. When a field is not provided, the corresponding
 * filter is not applied.
 * </p>
 */
@Getter
@Setter
public class AdminUserSearchRequest {

    /**
     * Free-text query used to match user email or resolved full name.
     */
    private String query;

    /**
     * Optional role filter. It allows restricting the search to a specific
     * user role, except administrative accounts which are excluded from
     * normal panel operations.
     */
    private UserRole role;

    /**
     * Optional active-status filter.
     */
    private Boolean active;
}