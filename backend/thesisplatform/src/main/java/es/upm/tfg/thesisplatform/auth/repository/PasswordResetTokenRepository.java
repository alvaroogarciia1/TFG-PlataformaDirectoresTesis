package es.upm.tfg.thesisplatform.auth.repository;

import es.upm.tfg.thesisplatform.auth.domain.PasswordResetToken;
import es.upm.tfg.thesisplatform.user.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(Long userId);

    Optional<PasswordResetToken> findByUser(User user);
}