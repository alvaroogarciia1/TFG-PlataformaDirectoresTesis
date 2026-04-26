package es.upm.tfg.thesisplatform.professor.repository;

import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.user.domain.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for accessing and querying professor profiles.
 *
 * <p>
 * It includes convenience methods for lookups by user identity and
 * custom queries for manual search operations.
 * </p>
 */
public interface ProfessorProfileRepository extends JpaRepository<ProfessorProfile, Long> {

  /**
   * Finds a professor profile by the email of the associated user.
   *
   * @param email user email
   * @return optional containing the professor profile when it exists
   */
  Optional<ProfessorProfile> findByUserEmail(String email);

  /**
   * Finds a professor profile by the identifier of the associated user.
   *
   * @param userId user identifier
   * @return optional containing the professor profile when it exists
   */
  Optional<ProfessorProfile> findByUserId(Long userId);

  /**
   * Finds a professor profile by the associated user entity.
   *
   * @param user associated user
   * @return optional containing the professor profile when it exists
   */
  Optional<ProfessorProfile> findByUser(User user);

  /**
   * Checks whether a professor profile exists for the given user email.
   *
   * @param email user email
   * @return {@code true} if a profile exists; {@code false} otherwise
   */
  boolean existsByUserEmail(String email);

  /**
   * Searches professor profiles using structured optional filters.
   *
   * <p>
   * This query allows filtering by:
   * <ul>
   * <li>Doctoral programs</li>
   * <li>Research lines</li>
   * <li>Availability</li>
   * <li>Institution (partial match)</li>
   * </ul>
   *
   * <p>
   * Related entities such as user, doctoral programs, research lines and
   * supervised theses are eagerly loaded to avoid lazy loading issues
   * in higher layers.
   * </p>
   *
   * @param programIds  doctoral program identifiers
   * @param lineIds     research line identifiers
   * @param available   availability filter
   * @param institution institution text filter
   * @return list of professor profiles matching the search criteria
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines", "supervisedTheses" })
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

  /**
   * Searches professor profiles by full name using partial matching.
   *
   * <p>
   * The search is case-insensitive and matches against the concatenation
   * of first name and last name.
   * </p>
   *
   * <p>
   * Related entities such as user, doctoral programs, research lines and
   * supervised theses are eagerly loaded.
   * </p>
   *
   * @param name name fragment
   * @return list of matching professor profiles
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines", "supervisedTheses" })
  @Query("""
          SELECT DISTINCT p FROM ProfessorProfile p
          WHERE (:name IS NULL OR :name = ''
                 OR LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))
      """)
  List<ProfessorProfile> searchByName(@Param("name") String name);

  /**
   * Retrieves a professor profile with related user, doctoral programs,
   * research lines and supervised theses eagerly loaded.
   *
   * <p>
   * This method is used when a fully detailed view of the profile is required,
   * including all associated thesis records.
   * </p>
   *
   * @param userId user identifier
   * @return optional containing the fully loaded profile
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines", "supervisedTheses" })
  Optional<ProfessorProfile> findDetailedByUserId(Long userId);

  /**
   * Retrieves a professor profile by user email with related user, doctoral
   * programs,
   * research lines and supervised theses eagerly loaded.
   *
   * <p>
   * This method is typically used to retrieve the authenticated professor profile
   * with all its associated data.
   * </p>
   *
   * @param email user email
   * @return optional containing the fully loaded profile
   */
  @EntityGraph(attributePaths = { "user", "doctoralPrograms", "researchLines", "supervisedTheses" })
  Optional<ProfessorProfile> findDetailedByUserEmail(String email);
}