package es.upm.tfg.thesisplatform.auth.service;

import es.upm.tfg.thesisplatform.auth.domain.PasswordResetToken;
import es.upm.tfg.thesisplatform.auth.dto.ForgotPasswordRequest;
import es.upm.tfg.thesisplatform.auth.dto.ResetPasswordRequest;
import es.upm.tfg.thesisplatform.auth.repository.PasswordResetTokenRepository;
import es.upm.tfg.thesisplatform.exception.InvalidTokenException;
import es.upm.tfg.thesisplatform.mail.EmailService;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service responsible for the password recovery workflow.
 *
 * <p>
 * It handles the generation of reset tokens, token persistence, email sending
 * and password update after validating the submitted token.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    /**
     * Repository used to retrieve user accounts by email.
     */
    private final UserRepository userRepository;

    /**
     * Repository used to persist and retrieve password reset tokens.
     */
    private final PasswordResetTokenRepository tokenRepository;

    /**
     * Component used to encode the new password before persisting it.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Service responsible for sending password reset emails.
     */
    private final EmailService emailService;

    /**
     * Starts the password recovery process for the provided email address.
     *
     * <p>
     * If the email is associated with an account, any previous reset token is
     * removed, a new token is generated and persisted, and the reset email is sent.
     * If the email does not exist, the method returns silently to avoid disclosing
     * whether an account is registered.
     * </p>
     *
     * @param request request containing the email address of the account
     */
    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return;
        }

        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    /**
     * Resets the password associated with a valid reset token.
     *
     * <p>
     * The token must exist, must not be already used and must not be expired.
     * Once the password is updated, the token is marked as used.
     * </p>
     *
     * @param request request containing the token and the new password
     * @throws InvalidTokenException if the token is invalid, already used or
     *                               expired
     */
    public void resetPassword(ResetPasswordRequest request) {

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token already used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        resetToken.setUsed(true);

        userRepository.save(user);
        tokenRepository.save(resetToken);
    }
}