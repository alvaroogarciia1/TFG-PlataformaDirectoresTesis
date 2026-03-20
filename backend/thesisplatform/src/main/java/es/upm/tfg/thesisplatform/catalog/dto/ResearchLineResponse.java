package es.upm.tfg.thesisplatform.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ResearchLineResponse {

    private Long id;
    private String name;
}