package es.upm.tfg.thesisplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used to request the password recovery process for an existing account.
 */
@Getter
@Setter
public class ForgotPasswordRequest {

    /**
     * Email address associated with the user account that wants to recover access.
     */
    @Email(message = "Email format is invalid")
    @NotBlank(message = "Email cannot be blank")
    private String email;
}