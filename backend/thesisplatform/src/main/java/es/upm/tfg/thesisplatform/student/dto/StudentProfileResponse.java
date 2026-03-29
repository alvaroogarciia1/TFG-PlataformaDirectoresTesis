package es.upm.tfg.thesisplatform.student.dto;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * DTO returned when exposing student profile information to the client.
 */
@Getter
@AllArgsConstructor
@Builder
public class StudentProfileResponse {

    /**
     * Unique identifier of the student profile.
     */
    private Long id;

    /**
     * Identifier of the associated user account.
     */
    private Long userId;

    /**
     * Email address of the student.
     */
    private String email;

    /**
     * Student first name.
     */
    private String firstName;

    /**
     * Student last name.
     */
    private String lastName;

    /**
     * Institution of origin of the student.
     */
    private String originInstitution;

    /**
     * Academic motivation of the student.
     */
    private String motivation;

    /**
     * Proposed thesis title.
     */
    private String proposedThesisTitle;

    /**
     * Indicates whether the student currently has funding.
     */
    private boolean hasFunding;

    /**
     * Funding type, when applicable.
     */
    private String fundingType;

    /**
     * Funding duration in months, when applicable.
     */
    private Integer fundingDurationMonths;

    /**
     * Indicates whether the student is willing to relocate to Madrid.
     */
    private boolean willingToRelocateToMadrid;

    /**
     * Expected dedication mode.
     */
    private DedicationType dedicationType;

    /**
     * Additional information provided by the student.
     */
    private String additionalInformation;

    /**
     * URL or reference to the student's CV.
     */
    private String cvUrl;

    /**
     * Names of the doctoral programs associated with the student.
     */
    private List<String> doctoralPrograms;

    /**
     * Names of the research lines associated with the student.
     */
    private List<String> researchLines;
}