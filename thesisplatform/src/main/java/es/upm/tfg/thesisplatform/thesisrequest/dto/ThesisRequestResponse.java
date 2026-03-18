package es.upm.tfg.thesisplatform.thesisrequest.dto;

import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class ThesisRequestResponse {

    private Long id;
    private Long studentUserId;
    private String studentEmail;
    private String studentFullName;

    private Long professorUserId;
    private String professorEmail;
    private String professorFullName;

    private String subject;
    private String message;
    private ThesisRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}