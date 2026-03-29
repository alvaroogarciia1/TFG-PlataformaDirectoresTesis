package es.upm.tfg.thesisplatform.student.repository;

import es.upm.tfg.thesisplatform.student.domain.DedicationType;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.user.domain.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for accessing and querying student profiles.
 *
 * <p>It includes convenience methods for lookups by user identity and
 * custom queries for manual search operations.</p>
 */
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

  /**
   * Retrieves a student profile with related user, doctoral programs
   * and research lines eagerly loaded.
   *
   * @param userId user identifier
   * @return optional containing the fully loaded profile
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines" })
  Optional<StudentProfile> findDetailedByUserId(Long userId);

  /**
   * Retrieves a student profile by user email with related user, doctoral programs
   * and research lines eagerly loaded.
   *
   * @param email user email
   * @return optional containing the fully loaded profile
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines" })
  Optional<StudentProfile> findDetailedByUserEmail(String email);

  /**
   * Finds a student profile by the email of the associated user.
   *
   * @param email user email
   * @return optional containing the student profile when it exists
   */
  Optional<StudentProfile> findByUserEmail(String email);

  /**
   * Finds a student profile by the identifier of the associated user.
   *
   * @param userId user identifier
   * @return optional containing the student profile when it exists
   */
  Optional<StudentProfile> findByUserId(Long userId);

  /**
   * Finds a student profile by the associated user entity.
   *
   * @param user associated user
   * @return optional containing the student profile when it exists
   */
  Optional<StudentProfile> findByUser(User user);

  /**
   * Checks whether a student profile exists for the given user email.
   *
   * @param email user email
   * @return {@code true} if a profile exists; {@code false} otherwise
   */
  boolean existsByUserEmail(String email);

  /**
   * Searches student profiles using structured optional filters.
   *
   * @param programIds doctoral program identifiers
   * @param lineIds research line identifiers
   * @param hasFunding funding filter
   * @param willingToRelocate relocation filter
   * @param dedicationType dedication type filter
   * @param originInstitution origin institution text filter
   * @return list of student profiles matching the search criteria
   */
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

  /**
   * Searches student profiles by proposed thesis title using partial matching.
   *
   * @param title thesis title fragment
   * @return list of matching student profiles
   */
  @Query("""
          SELECT s FROM StudentProfile s
          WHERE (:title IS NULL OR :title = ''
                 OR LOWER(s.proposedThesisTitle) LIKE LOWER(CONCAT('%', :title, '%')))
      """)
  List<StudentProfile> searchByThesisTitle(@Param("title") String title);
}