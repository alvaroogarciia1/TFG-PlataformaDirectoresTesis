package es.upm.tfg.thesisplatform.config;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Component responsible for preloading a default catalog of doctoral programs
 * when the application starts.
 *
 * <p>
 * The initialization is only performed when the doctoral program table is
 * empty, preventing duplicated seed data across multiple executions.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class CatalogDataInitializer implements CommandLineRunner {

        /**
         * Repository used to access and persist doctoral program entities.
         */
        private final DoctoralProgramRepository doctoralProgramRepository;

        /**
         * Executes the catalog initialization logic at application startup.
         *
         * @param args application startup arguments
         */
        @Override
        public void run(String... args) {
                initializeDoctoralPrograms();
        }

        /**
         * Inserts a predefined list of doctoral programs into the catalog when
         * no records are currently stored.
         */
        private void initializeDoctoralPrograms() {
                if (doctoralProgramRepository.count() > 0) {
                        return;
                }

                List<DoctoralProgram> programs = List.of(
                                DoctoralProgram.builder()
                                                .name("Doctorado en Inteligencia Artificial")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Software, Sistemas y Computación")
                                                .institution("UPM")
                                                .build());

                doctoralProgramRepository.saveAll(programs);
        }
}