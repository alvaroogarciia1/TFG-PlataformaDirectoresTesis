package es.upm.tfg.thesisplatform.professor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO used to filter professor search results.
 *
 * <p>All fields are optional. Null or empty values mean that the
 * corresponding filter is not applied.</p>
 */
@Getter
@Setter
public class ProfessorSearchRequest {

    /**
     * Doctoral program identifiers used as filter.
     */
    private List<Long> doctoralProgramIds;

    /**
     * Research line identifiers used as filter.
     */
    private List<Long> researchLineIds;

    /**
     * Availability filter.
     */
    private Boolean availableToSupervise;

    /**
     * Institution text filter.
     */
    private String institution;
}