package es.upm.tfg.thesisplatform.catalog.controller;

import es.upm.tfg.thesisplatform.catalog.dto.DoctoralProgramResponse;
import es.upm.tfg.thesisplatform.catalog.dto.ResearchLineResponse;
import es.upm.tfg.thesisplatform.catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/doctoral-programs")
    public List<DoctoralProgramResponse> getDoctoralPrograms() {
        return catalogService.getDoctoralPrograms();
    }

    @GetMapping("/research-lines")
    public List<ResearchLineResponse> getResearchLines() {
        return catalogService.getResearchLines();
    }
}