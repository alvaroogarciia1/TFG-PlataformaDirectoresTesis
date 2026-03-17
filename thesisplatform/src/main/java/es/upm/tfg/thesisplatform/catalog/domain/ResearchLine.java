package es.upm.tfg.thesisplatform.catalog.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "research_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}