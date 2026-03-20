package es.upm.tfg.thesisplatform.professor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class SupervisedThesisResponse {

    private Long id;
    private String doctoralStudentName;
    private String thesisTitle;
    private Integer defenseYear;
    private String researchDescription;
    private boolean industrialMention;
    private boolean internationalMention;
    private String results;
    private boolean ongoing;
}