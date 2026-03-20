package es.upm.tfg.thesisplatform.student.domain;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

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

    @Column(name = "origin_institution", nullable = false, length = 255)
    private String originInstitution;

    @Column(name = "motivation", nullable = false, columnDefinition = "TEXT")
    private String motivation;

    @Column(name = "proposed_thesis_title", nullable = false, length = 255)
    private String proposedThesisTitle;

    @Column(name = "has_funding", nullable = false)
    private boolean hasFunding;

    @Column(name = "funding_type", length = 100)
    private String fundingType;

    @Column(name = "funding_duration_months")
    private Integer fundingDurationMonths;

    @Column(name = "willing_to_relocate_to_madrid", nullable = false)
    private boolean willingToRelocateToMadrid;

    @Enumerated(EnumType.STRING)
    @Column(name = "dedication_type", nullable = false, length = 50)
    private DedicationType dedicationType;

    @Column(name = "additional_information", columnDefinition = "TEXT")
    private String additionalInformation;

    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(name = "student_profile_doctoral_program", joinColumns = @JoinColumn(name = "student_profile_id"), inverseJoinColumns = @JoinColumn(name = "doctoral_program_id"))
    private Set<DoctoralProgram> doctoralPrograms;

    @ManyToMany
    @JoinTable(name = "student_profile_research_line", joinColumns = @JoinColumn(name = "student_profile_id"), inverseJoinColumns = @JoinColumn(name = "research_line_id"))
    private Set<ResearchLine> researchLines;

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