package es.upm.tfg.thesisplatform.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used to establish a new password after a password recovery request.
 */
@Getter
@Setter
public class ResetPasswordRequest {

    /**
     * Password reset token received by the user.
     */
    @NotBlank
    private String token;

    /**
     * New password to be stored for the user account.
     */
    @NotBlank
    @Size(min = 6, max = 100)
    private String newPassword;
}