package es.upm.tfg.thesisplatform.professor.repository;

import es.upm.tfg.thesisplatform.professor.domain.SupervisedThesis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupervisedThesisRepository extends JpaRepository<SupervisedThesis, Long> {

    List<SupervisedThesis> findByProfessorProfileUserEmailOrderByCreatedAtDesc(String email);
}