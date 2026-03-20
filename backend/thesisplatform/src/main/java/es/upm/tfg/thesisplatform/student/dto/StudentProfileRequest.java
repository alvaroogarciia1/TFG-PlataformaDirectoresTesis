package es.upm.tfg.thesisplatform.student.dto;

import java.util.List;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProfileRequest {

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 150, message = "Last name must be at most 150 characters")
    private String lastName;

    @NotBlank(message = "Origin institution cannot be blank")
    @Size(max = 255, message = "Origin institution must be at most 255 characters")
    private String originInstitution;

    @NotBlank(message = "Motivation cannot be blank")
    private String motivation;

    @NotBlank(message = "Proposed thesis title cannot be blank")
    @Size(max = 255, message = "Proposed thesis title must be at most 255 characters")
    private String proposedThesisTitle;

    @NotNull(message = "Funding availability is required")
    private Boolean hasFunding;

    @Size(max = 100, message = "Funding type must be at most 100 characters")
    private String fundingType;

    @Min(value = 1, message = "Funding duration months must be at least 1")
    @Max(value = 120, message = "Funding duration months must be at most 120")
    private Integer fundingDurationMonths;

    @NotNull(message = "Relocation availability is required")
    private Boolean willingToRelocateToMadrid;

    @NotNull(message = "Dedication type is required")
    private DedicationType dedicationType;

    private String additionalInformation;

    @NotBlank(message = "CV reference cannot be blank")
    @Size(max = 500, message = "CV reference must be at most 500 characters")
    private String cvUrl;

    @NotEmpty(message = "At least one doctoral program is required")
    private List<Long> doctoralProgramIds;

    @NotEmpty(message = "At least one research line is required")
    private List<Long> researchLineIds;
}