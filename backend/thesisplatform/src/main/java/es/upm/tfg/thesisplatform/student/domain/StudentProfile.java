package es.upm.tfg.thesisplatform.student.domain;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Entity representing the academic profile of a student interested
 * in starting doctoral studies.
 *
 * <p>This entity stores academic background, doctoral interests,
 * funding information, relocation availability, dedication type,
 * CV reference and structured classification data such as doctoral
 * programs and research lines.</p>
 */
@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    /**
     * Unique identifier of the student profile.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User account associated one-to-one with the student profile.
     */
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Student first name.
     */
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    /**
     * Student last name.
     */
    @Column(name = "last_name", nullable = false, length = 150)
    private String lastName;

    /**
     * Institution of origin of the student.
     */
    @Column(name = "origin_institution", nullable = false, length = 255)
    private String originInstitution;

    /**
     * Academic motivation of the student.
     */
    @Column(name = "motivation", nullable = false, columnDefinition = "TEXT")
    private String motivation;

    /**
     * Proposed thesis title provided by the student.
     */
    @Column(name = "proposed_thesis_title", nullable = false, length = 255)
    private String proposedThesisTitle;

    /**
     * Indicates whether the student currently has funding.
     */
    @Column(name = "has_funding", nullable = false)
    private boolean hasFunding;

    /**
     * Funding type, when applicable.
     */
    @Column(name = "funding_type", length = 100)
    private String fundingType;

    /**
     * Funding duration in months, when applicable.
     */
    @Column(name = "funding_duration_months")
    private Integer fundingDurationMonths;

    /**
     * Indicates whether the student is willing to relocate to Madrid.
     */
    @Column(name = "willing_to_relocate_to_madrid", nullable = false)
    private boolean willingToRelocateToMadrid;

    /**
     * Expected dedication mode for doctoral studies.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "dedication_type", nullable = false, length = 50)
    private DedicationType dedicationType;

    /**
     * Additional information provided by the student.
     */
    @Column(name = "additional_information", columnDefinition = "TEXT")
    private String additionalInformation;

    /**
     * Public URL or reference to the student's CV file.
     */
    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;

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
     * Doctoral programs associated with the student profile.
     */
    @ManyToMany
    @JoinTable(name = "student_profile_doctoral_program", joinColumns = @JoinColumn(name = "student_profile_id"), inverseJoinColumns = @JoinColumn(name = "doctoral_program_id"))
    private Set<DoctoralProgram> doctoralPrograms;

    /**
     * Research lines associated with the student profile.
     */
    @ManyToMany
    @JoinTable(name = "student_profile_research_line", joinColumns = @JoinColumn(name = "student_profile_id"), inverseJoinColumns = @JoinColumn(name = "research_line_id"))
    private Set<ResearchLine> researchLines;

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