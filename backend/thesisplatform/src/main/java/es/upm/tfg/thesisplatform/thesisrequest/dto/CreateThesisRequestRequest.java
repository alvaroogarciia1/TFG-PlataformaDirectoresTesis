package es.upm.tfg.thesisplatform.thesisrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used when a student creates a thesis request addressed to a professor.
 */
@Getter
@Setter
public class CreateThesisRequestRequest {

    /**
     * Identifier of the professor user who will receive the request.
     */
    @NotNull(message = "Professor user id is required")
    private Long professorUserId;

    /**
     * Subject of the thesis request.
     */
    @NotBlank(message = "Subject cannot be blank")
    @Size(max = 255, message = "Subject must be at most 255 characters")
    private String subject;

    /**
     * Message body of the thesis request.
     */
    @NotBlank(message = "Message cannot be blank")
    private String message;
}