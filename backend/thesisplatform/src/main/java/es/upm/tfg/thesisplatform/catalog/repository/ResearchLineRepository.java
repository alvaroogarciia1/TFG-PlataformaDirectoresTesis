package es.upm.tfg.thesisplatform.catalog.repository;

import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for accessing and managing {@link ResearchLine} entities.
 */
public interface ResearchLineRepository extends JpaRepository<ResearchLine, Long> {

    /**
     * Retrieves a research line by name, ignoring letter case.
     *
     * @param name name of the research line to search for
     * @return optional containing the matching research line when it exists
     */
    Optional<ResearchLine> findByNameIgnoreCase(String name);
}