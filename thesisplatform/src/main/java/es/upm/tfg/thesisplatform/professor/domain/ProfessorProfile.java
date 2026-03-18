package es.upm.tfg.thesisplatform.professor.domain;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "professor_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 150)
    private String lastName;

    @Column(nullable = false, length = 255)
    private String institution;

    @Column(length = 255)
    private String department;

    @Column(name = "available_to_supervise", nullable = false)
    private boolean availableToSupervise;

    @Column(name = "max_phd_students")
    private Integer maxPhdStudents;

    @Column(name = "additional_information", columnDefinition = "TEXT")
    private String additionalInformation;

    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;

    @ManyToMany
    @JoinTable(name = "professor_profile_doctoral_program", joinColumns = @JoinColumn(name = "professor_profile_id"), inverseJoinColumns = @JoinColumn(name = "doctoral_program_id"))
    private Set<DoctoralProgram> doctoralPrograms;

    @ManyToMany
    @JoinTable(name = "professor_profile_research_line", joinColumns = @JoinColumn(name = "professor_profile_id"), inverseJoinColumns = @JoinColumn(name = "research_line_id"))
    private Set<ResearchLine> researchLines;

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