package es.upm.tfg.thesisplatform.professor.repository;

import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfessorProfileRepository extends JpaRepository<ProfessorProfile, Long> {

  Optional<ProfessorProfile> findByUserEmail(String email);

  Optional<ProfessorProfile> findByUserId(Long userId);

  boolean existsByUserEmail(String email);

  @Query("""
          SELECT DISTINCT p FROM ProfessorProfile p
          LEFT JOIN p.doctoralPrograms dp
          LEFT JOIN p.researchLines rl
          WHERE (:available IS NULL OR p.availableToSupervise = :available)
            AND (:institution IS NULL OR :institution = '' OR LOWER(p.institution) LIKE LOWER(CONCAT('%', :institution, '%')))
            AND (:programIds IS NULL OR dp.id IN :programIds)
            AND (:lineIds IS NULL OR rl.id IN :lineIds)
      """)
  List<ProfessorProfile> search(
      @Param("programIds") List<Long> programIds,
      @Param("lineIds") List<Long> lineIds,
      @Param("available") Boolean available,
      @Param("institution") String institution);

  @Query("""
          SELECT DISTINCT p FROM ProfessorProfile p
          WHERE (:name IS NULL OR :name = ''
                 OR LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))
      """)
  List<ProfessorProfile> searchByName(@Param("name") String name);
}