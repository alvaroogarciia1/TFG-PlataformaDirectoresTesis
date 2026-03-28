package es.upm.tfg.thesisplatform.admin.dto;

import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO returned when an administrator requests the complete detail of a user.
 *
 * <p>
 * This response contains generic account information together with the
 * corresponding academic profile, depending on whether the user is a student
 * or a professor.
 * </p>
 */
@Getter
@AllArgsConstructor
@Builder
public class AdminUserDetailResponse {

    /**
     * Unique identifier of the user account.
     */
    private Long id;

    /**
     * Email address associated with the account.
     */
    private String email;

    /**
     * Role assigned to the user in the platform.
     */
    private UserRole role;

    /**
     * Indicates whether the user account is currently active.
     */
    private boolean active;

    /**
     * Full name resolved from the associated academic profile when available.
     */
    private String fullName;

    /**
     * Student profile data, present only when the user has student role.
     */
    private StudentProfileResponse studentProfile;

    /**
     * Professor profile data, present only when the user has professor role.
     */
    private ProfessorProfileResponse professorProfile;
}