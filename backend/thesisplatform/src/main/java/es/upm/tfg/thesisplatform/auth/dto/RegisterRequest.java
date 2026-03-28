package es.upm.tfg.thesisplatform.auth.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO containing the data required to register a new account in the platform.
 */
@Getter
@Setter
public class RegisterRequest {

    /**
     * Email address that will uniquely identify the user account.
     */
    @Email(message = "Email format is invalid")
    @NotBlank(message = "Email cannot be blank")
    private String email;

    /**
     * Plain-text password provided during registration.
     *
     * <p>
     * The password is validated here and encoded before being stored.
     * </p>
     */
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 100)
    private String password;

    /**
     * Role requested for the new account.
     *
     * <p>
     * Self-registration is limited to student and professor roles.
     * </p>
     */
    @NotNull(message = "You must enter a role")
    private UserRole role;
}