package es.upm.tfg.thesisplatform.professor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used to create a supervised thesis record.
 */
@Getter
@Setter
public class SupervisedThesisRequest {

    /**
     * Full name of the doctoral student.
     */
    @NotBlank(message = "Doctoral student name cannot be blank")
    @Size(max = 255, message = "Doctoral student name must be at most 255 characters")
    private String doctoralStudentName;

    /**
     * Title of the thesis.
     */
    @NotBlank(message = "Thesis title cannot be blank")
    @Size(max = 500, message = "Thesis title must be at most 500 characters")
    private String thesisTitle;

    /**
     * Year in which the thesis was or will be defended.
     */
    @Min(value = 1900, message = "Defense year must be at least 1900")
    @Max(value = 2100, message = "Defense year must be at most 2100")
    private Integer defenseYear;

    /**
     * Description of the research topic or thesis area.
     */
    @NotBlank(message = "Research description cannot be blank")
    private String researchDescription;

    /**
     * Indicates whether the thesis has industrial mention.
     */
    @NotNull(message = "Industrial mention is required")
    private Boolean industrialMention;

    /**
     * Indicates whether the thesis has international mention.
     */
    @NotNull(message = "International mention is required")
    private Boolean internationalMention;

    /**
     * Results derived from the thesis, such as publications or patents.
     */
    private String results;

    /**
     * Indicates whether the thesis is still ongoing.
     */
    @NotNull(message = "Ongoing status is required")
    private Boolean ongoing;
}