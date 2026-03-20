package es.upm.tfg.thesisplatform.professor.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProfessorProfileRequest {

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 150, message = "Last name must be at most 150 characters")
    private String lastName;

    @NotBlank(message = "Institution cannot be blank")
    @Size(max = 255, message = "Institution must be at most 255 characters")
    private String institution;

    @Size(max = 255, message = "Department must be at most 255 characters")
    private String department;

    @NotNull(message = "Availability is required")
    private Boolean availableToSupervise;

    @Min(value = 1, message = "Max PhD students must be at least 1")
    @Max(value = 100, message = "Max PhD students must be at most 100")
    private Integer maxPhdStudents;

    private String additionalInformation;

    @NotBlank(message = "CV reference cannot be blank")
    @Size(max = 500, message = "CV reference must be at most 500 characters")
    private String cvUrl;

    @NotEmpty(message = "At least one doctoral program is required")
    private List<Long> doctoralProgramIds;

    @NotEmpty(message = "At least one research line is required")
    private List<Long> researchLineIds;
}