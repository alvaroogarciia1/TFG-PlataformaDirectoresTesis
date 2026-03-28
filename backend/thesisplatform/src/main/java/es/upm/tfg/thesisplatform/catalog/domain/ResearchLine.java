package es.upm.tfg.thesisplatform.catalog.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a research line available in the platform catalog.
 *
 * <p>
 * Research lines are one of the key structured elements of the system, as
 * they are used in academic profiles, filtering operations and affinity
 * calculation between students and professors.
 * </p>
 */
@Entity
@Table(name = "research_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchLine {

    /**
     * Unique identifier of the research line.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique name of the research line.
     */
    @Column(nullable = false, unique = true)
    private String name;
}