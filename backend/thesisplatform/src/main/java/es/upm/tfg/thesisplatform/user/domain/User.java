package es.upm.tfg.thesisplatform.user.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a user account in the platform.
 *
 * <p>
 * This entity stores the common authentication and authorization data
 * shared by all user types in the system, independently of whether the
 * account belongs to a student, professor or administrator.
 * </p>
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /**
     * Unique identifier of the user account.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Email address used as unique login identifier.
     */
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Encoded password stored for authentication purposes.
     */
    @Column(nullable = false, length = 255)
    private String password;

    /**
     * Role assigned to the user account.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    /**
     * Indicates whether the account is currently active.
     */
    @Column(nullable = false)
    private boolean active;

    /**
     * Timestamp indicating when the user account was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating the last time the user account was updated.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Initializes timestamps and default active status before the entity
     * is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        this.active = true;
    }

    /**
     * Updates the modification timestamp before each entity update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}