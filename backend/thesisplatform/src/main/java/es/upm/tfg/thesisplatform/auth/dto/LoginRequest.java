package es.upm.tfg.thesisplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO containing the credentials required to authenticate a user.
 */
@Getter
@Setter
public class LoginRequest {

    /**
     * Email address used as the login identifier.
     */
    @Email(message = "Email format is invalid")
    @NotBlank(message = "Email cannot be blank")
    private String email;

    /**
     * Plain-text password provided by the user during login.
     */
    @NotBlank(message = "Password cannot be blank")
    private String password;
}