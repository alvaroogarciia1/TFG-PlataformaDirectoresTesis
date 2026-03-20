package es.upm.tfg.thesisplatform.catalog.service;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.catalog.dto.DoctoralProgramResponse;
import es.upm.tfg.thesisplatform.catalog.dto.ResearchLineResponse;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import es.upm.tfg.thesisplatform.catalog.repository.ResearchLineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final DoctoralProgramRepository doctoralProgramRepository;
    private final ResearchLineRepository researchLineRepository;

    public List<DoctoralProgramResponse> getDoctoralPrograms() {
        return doctoralProgramRepository.findAll().stream()
                .map(this::mapDoctoralProgram)
                .toList();
    }

    public List<ResearchLineResponse> getResearchLines() {
        return researchLineRepository.findAll().stream()
                .map(this::mapResearchLine)
                .toList();
    }

    private DoctoralProgramResponse mapDoctoralProgram(DoctoralProgram program) {
        return DoctoralProgramResponse.builder()
                .id(program.getId())
                .name(program.getName())
                .institution(program.getInstitution())
                .build();
    }

    private ResearchLineResponse mapResearchLine(ResearchLine line) {
        return ResearchLineResponse.builder()
                .id(line.getId())
                .name(line.getName())
                .build();
    }
}