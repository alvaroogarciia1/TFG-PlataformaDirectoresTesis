package es.upm.tfg.thesisplatform.catalog.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing an official doctoral program that can be associated with
 * students and professors in the platform.
 *
 * <p>
 * Doctoral programs are part of the structured catalog used for profile
 * configuration, manual filtering and affinity calculation.
 * </p>
 */
@Entity
@Table(name = "doctoral_program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctoralProgram {

    /**
     * Unique identifier of the doctoral program.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the doctoral program.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Institution to which the doctoral program belongs.
     */
    @Column(nullable = false)
    private String institution;
}