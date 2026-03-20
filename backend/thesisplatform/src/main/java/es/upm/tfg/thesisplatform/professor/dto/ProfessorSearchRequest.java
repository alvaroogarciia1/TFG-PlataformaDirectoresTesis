package es.upm.tfg.thesisplatform.professor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProfessorSearchRequest {

    private List<Long> doctoralProgramIds;
    private List<Long> researchLineIds;
    private Boolean availableToSupervise;
    private String institution;
}