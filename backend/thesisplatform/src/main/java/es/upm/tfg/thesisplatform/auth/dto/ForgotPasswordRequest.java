package es.upm.tfg.thesisplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

    @Email(message = "Email format is invalid")
    @NotBlank(message = "Email cannot be blank")
    private String email;
}