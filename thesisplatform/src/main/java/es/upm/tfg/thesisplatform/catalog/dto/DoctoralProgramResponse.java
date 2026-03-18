package es.upm.tfg.thesisplatform.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class DoctoralProgramResponse {

    private Long id;
    private String name;
    private String institution;
}