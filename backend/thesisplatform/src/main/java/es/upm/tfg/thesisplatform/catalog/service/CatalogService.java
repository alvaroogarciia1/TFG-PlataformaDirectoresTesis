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

/**
 * Service responsible for retrieving structured catalog data used throughout
 * the platform.
 *
 * <p>
 * This service centralizes access to academic classification entities such as
 * doctoral programs and research lines, exposing them as response DTOs for
 * frontend consumption.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class CatalogService {

    /**
     * Repository used to access doctoral programs.
     */
    private final DoctoralProgramRepository doctoralProgramRepository;

    /**
     * Repository used to access research lines.
     */
    private final ResearchLineRepository researchLineRepository;

    /**
     * Retrieves all doctoral programs stored in the catalog.
     *
     * @return list of doctoral program response DTOs
     */
    public List<DoctoralProgramResponse> getDoctoralPrograms() {
        return doctoralProgramRepository.findAll().stream()
                .map(this::mapDoctoralProgram)
                .toList();
    }

    /**
     * Retrieves all research lines stored in the catalog.
     *
     * @return list of research line response DTOs
     */
    public List<ResearchLineResponse> getResearchLines() {
        return researchLineRepository.findAll().stream()
                .map(this::mapResearchLine)
                .toList();
    }

    /**
     * Maps a doctoral program entity to its response DTO representation.
     *
     * @param program doctoral program entity to map
     * @return mapped doctoral program response
     */
    private DoctoralProgramResponse mapDoctoralProgram(DoctoralProgram program) {
        return DoctoralProgramResponse.builder()
                .id(program.getId())
                .name(program.getName())
                .institution(program.getInstitution())
                .build();
    }

    /**
     * Maps a research line entity to its response DTO representation.
     *
     * @param line research line entity to map
     * @return mapped research line response
     */
    private ResearchLineResponse mapResearchLine(ResearchLine line) {
        return ResearchLineResponse.builder()
                .id(line.getId())
                .name(line.getName())
                .build();
    }
}