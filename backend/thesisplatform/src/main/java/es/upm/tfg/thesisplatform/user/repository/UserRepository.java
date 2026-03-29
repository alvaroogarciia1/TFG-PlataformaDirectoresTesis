package es.upm.tfg.thesisplatform.user.repository;

import es.upm.tfg.thesisplatform.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for accessing and managing user accounts.
 *
 * <p>
 * This repository provides the basic persistence operations inherited
 * from {@link JpaRepository}, together with convenience methods for lookup
 * and existence checks by email.
 * </p>
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Retrieves a user account by its email address.
     *
     * @param email email address of the user
     * @return optional containing the user when it exists
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks whether a user account already exists with the given email address.
     *
     * @param email email address to check
     * @return {@code true} if a user exists with that email; {@code false}
     *         otherwise
     */
    boolean existsByEmail(String email);
}