package es.upm.tfg.thesisplatform.catalog.repository;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctoralProgramRepository extends JpaRepository<DoctoralProgram, Long> {
}