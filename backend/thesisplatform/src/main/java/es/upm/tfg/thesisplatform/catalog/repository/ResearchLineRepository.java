package es.upm.tfg.thesisplatform.catalog.repository;

import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResearchLineRepository extends JpaRepository<ResearchLine, Long> {
}