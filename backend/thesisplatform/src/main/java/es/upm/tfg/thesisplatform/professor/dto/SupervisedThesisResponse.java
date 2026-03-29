package es.upm.tfg.thesisplatform.professor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO returned when exposing supervised thesis information.
 */
@Getter
@AllArgsConstructor
@Builder
public class SupervisedThesisResponse {

    /**
     * Unique identifier of the supervised thesis record.
     */
    private Long id;

    /**
     * Full name of the doctoral student.
     */
    private String doctoralStudentName;

    /**
     * Title of the thesis.
     */
    private String thesisTitle;

    /**
     * Defense year of the thesis.
     */
    private Integer defenseYear;

    /**
     * Description of the research topic.
     */
    private String researchDescription;

    /**
     * Indicates whether the thesis has industrial mention.
     */
    private boolean industrialMention;

    /**
     * Indicates whether the thesis has international mention.
     */
    private boolean internationalMention;

    /**
     * Results associated with the thesis.
     */
    private String results;

    /**
     * Indicates whether the thesis is still ongoing.
     */
    private boolean ongoing;
}