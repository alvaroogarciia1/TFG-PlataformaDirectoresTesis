package es.upm.tfg.thesisplatform.student.dto;

import java.util.List;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used to create or update a student profile.
 *
 * <p>It contains the structured academic and personal information
 * required by the platform for search and matching operations.</p>
 */
@Getter
@Setter
public class StudentProfileRequest {

    /**
     * Student first name.
     */
    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    /**
     * Student last name.
     */
    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 150, message = "Last name must be at most 150 characters")
    private String lastName;

    /**
     * Institution of origin of the student.
     */
    @NotBlank(message = "Origin institution cannot be blank")
    @Size(max = 255, message = "Origin institution must be at most 255 characters")
    private String originInstitution;

    /**
     * Academic motivation of the student.
     */
    @NotBlank(message = "Motivation cannot be blank")
    private String motivation;

    /**
     * Proposed thesis title.
     */
    @NotBlank(message = "Proposed thesis title cannot be blank")
    @Size(max = 255, message = "Proposed thesis title must be at most 255 characters")
    private String proposedThesisTitle;

    /**
     * Indicates whether the student currently has funding.
     */
    @NotNull(message = "Funding availability is required")
    private Boolean hasFunding;

    /**
     * Funding type, when applicable.
     */
    @Size(max = 100, message = "Funding type must be at most 100 characters")
    private String fundingType;

    /**
     * Funding duration in months, when applicable.
     */
    @Min(value = 1, message = "Funding duration months must be at least 1")
    @Max(value = 120, message = "Funding duration months must be at most 120")
    private Integer fundingDurationMonths;

    /**
     * Indicates whether the student is willing to relocate to Madrid.
     */
    @NotNull(message = "Relocation availability is required")
    private Boolean willingToRelocateToMadrid;

    /**
     * Expected dedication mode.
     */
    @NotNull(message = "Dedication type is required")
    private DedicationType dedicationType;

    /**
     * Additional information provided by the student.
     */
    private String additionalInformation;

    /**
     * Reference or URL to the CV file.
     */
    @NotBlank(message = "CV reference cannot be blank")
    @Size(max = 500, message = "CV reference must be at most 500 characters")
    private String cvUrl;

    /**
     * Identifiers of the doctoral programs associated with the student.
     */
    @NotEmpty(message = "At least one doctoral program is required")
    private List<Long> doctoralProgramIds;

    /**
     * Names of the research lines associated with the student.
     */
    @NotEmpty(message = "At least one research line is required")
    private List<String> researchLines;
}