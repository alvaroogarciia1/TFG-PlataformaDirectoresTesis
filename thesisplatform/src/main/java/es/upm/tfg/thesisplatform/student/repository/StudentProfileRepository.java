package es.upm.tfg.thesisplatform.student.repository;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserEmail(String email);

    boolean existsByUserEmail(String email);

    @Query("""
                SELECT DISTINCT s FROM StudentProfile s
                LEFT JOIN s.doctoralPrograms dp
                LEFT JOIN s.researchLines rl
                WHERE (:hasFunding IS NULL OR s.hasFunding = :hasFunding)
                  AND (:willingToRelocate IS NULL OR s.willingToRelocateToMadrid = :willingToRelocate)
                  AND (:dedicationType IS NULL OR s.dedicationType = :dedicationType)
                  AND (:originInstitution IS NULL OR :originInstitution = '' OR LOWER(s.originInstitution) LIKE LOWER(CONCAT('%', :originInstitution, '%')))
                  AND (:programIds IS NULL OR dp.id IN :programIds)
                  AND (:lineIds IS NULL OR rl.id IN :lineIds)
            """)
    List<StudentProfile> search(
            @Param("programIds") List<Long> programIds,
            @Param("lineIds") List<Long> lineIds,
            @Param("hasFunding") Boolean hasFunding,
            @Param("willingToRelocate") Boolean willingToRelocate,
            @Param("dedicationType") DedicationType dedicationType,
            @Param("originInstitution") String originInstitution);
}