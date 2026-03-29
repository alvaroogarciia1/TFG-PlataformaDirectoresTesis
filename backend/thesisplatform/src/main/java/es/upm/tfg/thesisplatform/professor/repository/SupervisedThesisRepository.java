package es.upm.tfg.thesisplatform.professor.repository;

import es.upm.tfg.thesisplatform.professor.domain.SupervisedThesis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for accessing supervised thesis records.
 */
public interface SupervisedThesisRepository extends JpaRepository<SupervisedThesis, Long> {

    /**
     * Retrieves all supervised theses belonging to a professor,
     * ordered by creation date descending.
     *
     * @param email professor user email
     * @return list of supervised theses
     */
    List<SupervisedThesis> findByProfessorProfileUserEmailOrderByCreatedAtDesc(String email);
}