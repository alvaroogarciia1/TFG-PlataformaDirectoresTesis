package es.upm.tfg.thesisplatform.catalog.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctoral_program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctoralProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String institution;
}