package es.upm.tfg.thesisplatform.thesisrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used when a professor creates a thesis request addressed to a student.
 */
@Getter
@Setter
public class ProfessorThesisRequestCreate {

    /**
     * Identifier of the student user who will receive the request.
     */
    @NotNull(message = "Student user id is required")
    private Long studentUserId;

    /**
     * Subject of the thesis request.
     */
    @NotBlank(message = "Subject cannot be blank")
    private String subject;

    /**
     * Message body of the thesis request.
     */
    @NotBlank(message = "Message cannot be blank")
    private String message;
}