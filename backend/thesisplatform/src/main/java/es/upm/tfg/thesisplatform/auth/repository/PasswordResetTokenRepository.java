package es.upm.tfg.thesisplatform.auth.repository;

import es.upm.tfg.thesisplatform.auth.domain.PasswordResetToken;
import es.upm.tfg.thesisplatform.user.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for accessing and managing {@link PasswordResetToken} entities.
 *
 * <p>
 * It provides query methods to retrieve tokens by their value or associated
 * user, as well as deletion of previous tokens linked to a user account.
 * </p>
 */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Retrieves a password reset token by its unique token string.
     *
     * @param token token value to search for
     * @return optional containing the matching token when it exists
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Deletes password reset tokens associated with a specific user identifier.
     *
     * @param userId identifier of the user whose tokens must be removed
     */
    void deleteByUserId(Long userId);

    /**
     * Retrieves the password reset token associated with the given user.
     *
     * @param user user whose token is being searched
     * @return optional containing the token when it exists
     */
    Optional<PasswordResetToken> findByUser(User user);
}