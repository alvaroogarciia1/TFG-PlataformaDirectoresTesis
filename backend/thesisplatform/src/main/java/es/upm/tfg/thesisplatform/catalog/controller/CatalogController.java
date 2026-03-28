package es.upm.tfg.thesisplatform.catalog.controller;

import es.upm.tfg.thesisplatform.catalog.dto.DoctoralProgramResponse;
import es.upm.tfg.thesisplatform.catalog.dto.ResearchLineResponse;
import es.upm.tfg.thesisplatform.catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller responsible for exposing catalog data used across the
 * platform.
 *
 * <p>
 * This controller provides read-only endpoints for structured academic
 * classifications such as doctoral programs and research lines, which are later
 * reused in profile creation, search filters and matching processes.
 * </p>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/catalog")
public class CatalogController {

    /**
     * Service layer that manages retrieval of catalog elements.
     */
    private final CatalogService catalogService;

    /**
     * Retrieves all doctoral programs available in the system catalog.
     *
     * @return list of doctoral program DTOs
     */
    @GetMapping("/doctoral-programs")
    public List<DoctoralProgramResponse> getDoctoralPrograms() {
        return catalogService.getDoctoralPrograms();
    }

    /**
     * Retrieves all research lines available in the system catalog.
     *
     * @return list of research line DTOs
     */
    @GetMapping("/research-lines")
    public List<ResearchLineResponse> getResearchLines() {
        return catalogService.getResearchLines();
    }
}