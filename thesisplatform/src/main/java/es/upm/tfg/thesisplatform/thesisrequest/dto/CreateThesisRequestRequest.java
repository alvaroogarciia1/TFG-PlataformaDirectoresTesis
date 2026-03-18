package es.upm.tfg.thesisplatform.thesisrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateThesisRequestRequest {

    @NotNull(message = "Professor user id is required")
    private Long professorUserId;

    @NotBlank(message = "Subject cannot be blank")
    @Size(max = 255, message = "Subject must be at most 255 characters")
    private String subject;

    @NotBlank(message = "Message cannot be blank")
    private String message;
}