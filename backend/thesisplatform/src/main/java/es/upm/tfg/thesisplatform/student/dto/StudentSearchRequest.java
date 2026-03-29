package es.upm.tfg.thesisplatform.student.dto;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO used to filter student search results.
 *
 * <p>
 * All fields are optional. Null or empty values mean that the
 * corresponding filter is not applied.
 * </p>
 */
@Getter
@Setter
public class StudentSearchRequest {

    /**
     * Doctoral program identifiers used as filter.
     */
    private List<Long> doctoralProgramIds;

    /**
     * Research line identifiers used as filter.
     */
    private List<Long> researchLineIds;

    /**
     * Funding availability filter.
     */
    private Boolean hasFunding;

    /**
     * Relocation availability filter.
     */
    private Boolean willingToRelocateToMadrid;

    /**
     * Dedication type filter.
     */
    private DedicationType dedicationType;

    /**
     * Origin institution text filter.
     */
    private String originInstitution;
}