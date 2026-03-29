package es.upm.tfg.thesisplatform.thesisrequest.dto;

import es.upm.tfg.thesisplatform.thesisrequest.domain.RequestInitiator;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * DTO returned when exposing thesis request information to the client.
 *
 * <p>
 * It includes both participant identities, request content,
 * current status, initiator and timestamps.
 * </p>
 */
@Getter
@AllArgsConstructor
@Builder
public class ThesisRequestResponse {

    /**
     * Unique identifier of the thesis request.
     */
    private Long id;

    /**
     * Identifier of the student user.
     */
    private Long studentUserId;

    /**
     * Email of the student user.
     */
    private String studentEmail;

    /**
     * Full name of the student, when available.
     */
    private String studentFullName;

    /**
     * Identifier of the professor user.
     */
    private Long professorUserId;

    /**
     * Email of the professor user.
     */
    private String professorEmail;

    /**
     * Full name of the professor, when available.
     */
    private String professorFullName;

    /**
     * Subject of the request.
     */
    private String subject;

    /**
     * Message content of the request.
     */
    private String message;

    /**
     * Current status of the request.
     */
    private ThesisRequestStatus status;

    /**
     * Role that originally created the request.
     */
    private RequestInitiator initiator;

    /**
     * Request creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Request last update timestamp.
     */
    private LocalDateTime updatedAt;
}