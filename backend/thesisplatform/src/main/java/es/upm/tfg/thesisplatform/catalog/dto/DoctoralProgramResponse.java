package es.upm.tfg.thesisplatform.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO used to expose doctoral program information to clients.
 */
@Getter
@AllArgsConstructor
@Builder
public class DoctoralProgramResponse {

    /**
     * Unique identifier of the doctoral program.
     */
    private Long id;

    /**
     * Name of the doctoral program.
     */
    private String name;

    /**
     * Institution associated with the doctoral program.
     */
    private String institution;
}