package es.upm.tfg.thesisplatform.student.dto;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class StudentProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String originInstitution;
    private String motivation;
    private String proposedThesisTitle;
    private boolean hasFunding;
    private String fundingType;
    private Integer fundingDurationMonths;
    private boolean willingToRelocateToMadrid;
    private DedicationType dedicationType;
    private String additionalInformation;
    private String cvUrl;
    private List<String> doctoralPrograms;
    private List<String> researchLines;
}