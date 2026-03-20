package es.upm.tfg.thesisplatform.professor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ProfessorProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String institution;
    private String department;
    private boolean availableToSupervise;
    private Integer maxPhdStudents;
    private String additionalInformation;
    private String cvUrl;
    private List<String> doctoralPrograms;
    private List<String> researchLines;
}