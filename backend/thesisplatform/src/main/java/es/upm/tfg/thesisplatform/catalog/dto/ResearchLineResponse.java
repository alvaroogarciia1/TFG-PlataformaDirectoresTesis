package es.upm.tfg.thesisplatform.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO used to expose research line information to clients.
 */
@Getter
@AllArgsConstructor
@Builder
public class ResearchLineResponse {

    /**
     * Unique identifier of the research line.
     */
    private Long id;

    /**
     * Name of the research line.
     */
    private String name;
}