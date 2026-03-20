package es.upm.tfg.thesisplatform.professor.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "supervised_thesis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisedThesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "professor_profile_id", nullable = false)
    private ProfessorProfile professorProfile;

    @Column(name = "doctoral_student_name", nullable = false, length = 255)
    private String doctoralStudentName;

    @Column(name = "thesis_title", nullable = false, length = 500)
    private String thesisTitle;

    @Column(name = "defense_year")
    private Integer defenseYear;

    @Column(name = "research_description", columnDefinition = "TEXT")
    private String researchDescription;

    @Column(name = "industrial_mention", nullable = false)
    private boolean industrialMention;

    @Column(name = "international_mention", nullable = false)
    private boolean internationalMention;

    @Column(name = "results", columnDefinition = "TEXT")
    private String results;

    @Column(name = "ongoing", nullable = false)
    private boolean ongoing;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}