package es.upm.tfg.thesisplatform.config.repository;

import es.upm.tfg.thesisplatform.config.domain.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigurationRepository
        extends JpaRepository<SystemConfiguration, Long> {
}