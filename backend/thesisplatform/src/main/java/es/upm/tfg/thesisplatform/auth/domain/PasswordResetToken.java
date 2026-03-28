package es.upm.tfg.thesisplatform.auth.domain;

import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity that represents a password reset token associated with a user account.
 *
 * <p>
 * This token is generated when a password recovery request is initiated and
 * is later validated when the user attempts to establish a new password.
 * </p>
 */
@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    /**
     * Unique identifier of the password reset token record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User account associated with the reset token.
     */
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Unique token string sent to the user for password recovery.
     */
    @Column(nullable = false, unique = true)
    private String token;

    /**
     * Expiration date and time of the token.
     */
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /**
     * Indicates whether the token has already been used successfully.
     */
    @Column(nullable = false)
    private boolean used;
}