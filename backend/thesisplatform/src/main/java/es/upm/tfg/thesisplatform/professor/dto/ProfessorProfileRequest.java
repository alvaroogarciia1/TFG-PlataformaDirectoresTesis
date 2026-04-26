package es.upm.tfg.thesisplatform.professor.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO used to create or update a professor profile.
 *
 * <p>
 * It contains the structured academic and institutional information
 * required by the platform for search and matching operations.
 * </p>
 */
@Getter
@Setter
public class ProfessorProfileRequest {

    /**
     * Professor first name.
     */
    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    /**
     * Professor last name.
     */
    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 150, message = "Last name must be at most 150 characters")
    private String lastName;

    /**
     * Institution of the professor.
     */
    @NotBlank(message = "Institution cannot be blank")
    @Size(max = 255, message = "Institution must be at most 255 characters")
    private String institution;

    /**
     * Department or academic unit of the professor.
     */
    @Size(max = 255, message = "Department must be at most 255 characters")
    private String department;

    /**
     * Indicates whether the professor is available to supervise new theses.
     */
    @NotNull(message = "Availability is required")
    private Boolean availableToSupervise;

    /**
     * Maximum number of PhD students the professor accepts simultaneously.
     */
    @Min(value = 1, message = "Max PhD students must be at least 1")
    @Max(value = 100, message = "Max PhD students must be at most 100")
    private Integer maxPhdStudents;

    /**
     * Additional information provided by the professor.
     */
    private String additionalInformation;

    /**
     * Reference or URL to the CV file.
     */
    @Size(max = 500, message = "CV reference must be at most 500 characters")
    private String cvUrl;

    /**
     * Identifiers of the doctoral programs associated with the professor.
     */
    @NotEmpty(message = "At least one doctoral program is required")
    private List<Long> doctoralProgramIds;

    /**
     * Names of the research lines associated with the professor.
     */
    @NotEmpty(message = "At least one research line is required")
    private List<String> researchLines;
}