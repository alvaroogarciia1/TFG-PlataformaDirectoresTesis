package es.upm.tfg.thesisplatform.professor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupervisedThesisRequest {

    @NotBlank(message = "Doctoral student name cannot be blank")
    @Size(max = 255, message = "Doctoral student name must be at most 255 characters")
    private String doctoralStudentName;

    @NotBlank(message = "Thesis title cannot be blank")
    @Size(max = 500, message = "Thesis title must be at most 500 characters")
    private String thesisTitle;

    @Min(value = 1900, message = "Defense year must be at least 1900")
    @Max(value = 2100, message = "Defense year must be at most 2100")
    private Integer defenseYear;

    @NotBlank(message = "Research description cannot be blank")
    private String researchDescription;

    @NotNull(message = "Industrial mention is required")
    private Boolean industrialMention;

    @NotNull(message = "International mention is required")
    private Boolean internationalMention;

    private String results;

    @NotNull(message = "Ongoing status is required")
    private Boolean ongoing;
}