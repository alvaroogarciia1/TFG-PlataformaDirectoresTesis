package es.upm.tfg.thesisplatform.professor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * DTO returned when exposing professor profile information to the client.
 */
@Getter
@AllArgsConstructor
@Builder
public class ProfessorProfileResponse {

    /**
     * Unique identifier of the professor profile.
     */
    private Long id;

    /**
     * Identifier of the associated user account.
     */
    private Long userId;

    /**
     * Email address of the professor.
     */
    private String email;

    /**
     * Professor first name.
     */
    private String firstName;

    /**
     * Professor last name.
     */
    private String lastName;

    /**
     * Institution of the professor.
     */
    private String institution;

    /**
     * Department or academic unit of the professor.
     */
    private String department;

    /**
     * Indicates whether the professor is currently available to supervise.
     */
    private boolean availableToSupervise;

    /**
     * Maximum number of PhD students the professor accepts.
     */
    private Integer maxPhdStudents;

    /**
     * Additional information provided by the professor.
     */
    private String additionalInformation;

    /**
     * URL or reference to the professor CV.
     */
    private String cvUrl;

    /**
     * Names of the doctoral programs associated with the professor.
     */
    private List<String> doctoralPrograms;

    /**
     * Names of the research lines associated with the professor.
     */
    private List<String> researchLines;

    /**
     * The previous or current theses directed by the professor.
     */
    private List<SupervisedThesisResponse> supervisedTheses;
}