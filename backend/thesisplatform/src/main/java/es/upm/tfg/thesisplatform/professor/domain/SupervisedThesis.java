package es.upm.tfg.thesisplatform.professor.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a thesis supervised by a professor.
 *
 * <p>This entity stores both completed and ongoing supervised theses,
 * including descriptive, academic and results-related information.</p>
 */
@Entity
@Table(name = "supervised_thesis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisedThesis {

    /**
     * Unique identifier of the supervised thesis record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Professor profile that owns the supervised thesis record.
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "professor_profile_id", nullable = false)
    private ProfessorProfile professorProfile;

    /**
     * Full name of the doctoral student.
     */
    @Column(name = "doctoral_student_name", nullable = false, length = 255)
    private String doctoralStudentName;

    /**
     * Title of the supervised thesis.
     */
    @Column(name = "thesis_title", nullable = false, length = 500)
    private String thesisTitle;

    /**
     * Year of thesis defense, when applicable.
     */
    @Column(name = "defense_year")
    private Integer defenseYear;

    /**
     * Textual description of the research topic or thesis area.
     */
    @Column(name = "research_description", columnDefinition = "TEXT")
    private String researchDescription;

    /**
     * Indicates whether the thesis has industrial mention.
     */
    @Column(name = "industrial_mention", nullable = false)
    private boolean industrialMention;

    /**
     * Indicates whether the thesis has international mention.
     */
    @Column(name = "international_mention", nullable = false)
    private boolean internationalMention;

    /**
     * Results associated with the thesis, such as publications or patents.
     */
    @Column(name = "results", columnDefinition = "TEXT")
    private String results;

    /**
     * Indicates whether the thesis is still ongoing.
     */
    @Column(name = "ongoing", nullable = false)
    private boolean ongoing;

    /**
     * Timestamp indicating when the record was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating the last time the record was updated.
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