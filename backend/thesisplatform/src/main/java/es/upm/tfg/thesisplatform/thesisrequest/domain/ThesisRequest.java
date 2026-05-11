package es.upm.tfg.thesisplatform.thesisrequest.domain;

import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a formal thesis direction request exchanged between
 * a student and a professor.
 *
 * <p>
 * This entity stores the sender and recipient, the subject and message,
 * the current request status, timestamps and the role that initiated the
 * request.
 * </p>
 */
@Entity
@Table(name = "thesis_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThesisRequest {

    /**
     * Unique identifier of the thesis request.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Student user involved in the request.
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "student_user_id", nullable = false)
    private User student;

    /**
     * Professor user involved in the request.
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "professor_user_id", nullable = false)
    private User professor;

    /**
     * Subject of the request.
     */
    @Column(nullable = false, length = 255)
    private String subject;

    /**
     * Detailed message included in the request.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
 * Reason provided when the request is rejected.
 */
@Column(name = "rejection_reason", columnDefinition = "TEXT")
private String rejectionReason;

    /**
     * Current status of the request.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ThesisRequestStatus status;

    /**
     * Timestamp indicating when the request was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating when the request was last updated.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Role that originally initiated the request.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "initiator", nullable = false)
    private RequestInitiator initiator;

    /**
     * Initializes timestamps and default status before the entity is first
     * persisted.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ThesisRequestStatus.PENDING;
        }
    }

    /**
     * Updates the modification timestamp before each entity update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}