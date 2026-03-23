package es.upm.tfg.thesisplatform.config;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CatalogDataInitializer implements CommandLineRunner {

        private final DoctoralProgramRepository doctoralProgramRepository;

        @Override
        public void run(String... args) {
                initializeDoctoralPrograms();
        }

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
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Ciencia de Datos")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Ciberseguridad")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Ingeniería Informática")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Sistemas Distribuidos y Cloud Computing")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Robótica y Automatización")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Computación Visual")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Ingeniería del Conocimiento")
                                                .institution("UPM")
                                                .build(),
                                DoctoralProgram.builder()
                                                .name("Doctorado en Tecnologías de la Información y las Comunicaciones")
                                                .institution("UPM")
                                                .build());

                doctoralProgramRepository.saveAll(programs);
        }
}