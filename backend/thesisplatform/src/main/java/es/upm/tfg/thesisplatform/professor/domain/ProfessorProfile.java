package es.upm.tfg.thesisplatform.professor.domain;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Entity representing the academic profile of a professor.
 *
 * <p>This entity stores institutional data, supervision availability,
 * research lines, doctoral programs and CV reference, and is used in
 * both manual search and automatic matching processes.</p>
 */
@Entity
@Table(name = "professor_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessorProfile {

    /**
     * Unique identifier of the professor profile.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User account associated one-to-one with the professor profile.
     */
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Professor first name.
     */
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    /**
     * Professor last name.
     */
    @Column(name = "last_name", nullable = false, length = 150)
    private String lastName;

    /**
     * Institution to which the professor belongs.
     */
    @Column(nullable = false, length = 255)
    private String institution;

    /**
     * Department or academic unit of the professor.
     */
    @Column(length = 255)
    private String department;

    /**
     * Indicates whether the professor is currently available to supervise theses.
     */
    @Column(name = "available_to_supervise", nullable = false)
    private boolean availableToSupervise;

    /**
     * Maximum number of PhD students the professor is willing to supervise.
     */
    @Column(name = "max_phd_students")
    private Integer maxPhdStudents;

    /**
     * Additional academic or contextual information provided by the professor.
     */
    @Column(name = "additional_information", columnDefinition = "TEXT")
    private String additionalInformation;

    /**
     * Public URL or reference to the professor's CV file.
     */
    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;

    /**
     * Doctoral programs associated with the professor profile.
     */
    @ManyToMany
    @JoinTable(name = "professor_profile_doctoral_program", joinColumns = @JoinColumn(name = "professor_profile_id"), inverseJoinColumns = @JoinColumn(name = "doctoral_program_id"))
    private Set<DoctoralProgram> doctoralPrograms;

    /**
     * Research lines associated with the professor profile.
     */
    @ManyToMany
    @JoinTable(name = "professor_profile_research_line", joinColumns = @JoinColumn(name = "professor_profile_id"), inverseJoinColumns = @JoinColumn(name = "research_line_id"))
    private Set<ResearchLine> researchLines;

    /**
     * Timestamp indicating when the profile was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating the last time the profile was updated.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Initializes creation and update timestamps before the entity is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Updates the modification timestamp before each entity update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}