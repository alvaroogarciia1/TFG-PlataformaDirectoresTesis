package es.upm.tfg.thesisplatform.student.dto;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StudentSearchRequest {

    private List<Long> doctoralProgramIds;
    private List<Long> researchLineIds;
    private Boolean hasFunding;
    private Boolean willingToRelocateToMadrid;
    private DedicationType dedicationType;
    private String originInstitution;
}