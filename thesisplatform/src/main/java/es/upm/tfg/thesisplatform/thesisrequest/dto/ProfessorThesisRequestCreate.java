package es.upm.tfg.thesisplatform.thesisrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorThesisRequestCreate {

    @NotNull(message = "Student user id is required")
    private Long studentUserId;

    @NotBlank(message = "Subject cannot be blank")
    private String subject;

    @NotBlank(message = "Message cannot be blank")
    private String message;
}