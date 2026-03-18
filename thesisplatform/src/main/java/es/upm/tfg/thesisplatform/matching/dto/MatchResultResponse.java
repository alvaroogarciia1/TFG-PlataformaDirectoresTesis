package es.upm.tfg.thesisplatform.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class MatchResultResponse {

    private Long userId;
    private String email;
    private String fullName;
    private String institution;
    private double score;
    private int matchingResearchLines;
    private int matchingDoctoralPrograms;
    private List<String> researchLines;
    private List<String> doctoralPrograms;
}