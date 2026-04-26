package es.upm.tfg.thesisplatform.config;

import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component responsible for inserting a default administrator account when the
 * application starts and such account does not already exist.
 *
 * <p>
 * This initializer guarantees that the platform always has at least one
 * administrative user capable of managing the system from the admin panel.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements CommandLineRunner {

    /**
     * Repository used to query and persist user accounts.
     */
    private final UserRepository userRepository;

    /**
     * Encoder used to securely hash the default administrator password.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Email address of the default administrator account.
     */
    @Value("${app.admin.email}")
    private String adminEmail;

    /**
     * Password of the default administrator account.
     */
    @Value("${app.admin.password}")
    private String adminPassword;

    /**
     * Executes the initialization logic once the Spring Boot application has
     * started.
     *
     * @param args application startup arguments
     */
    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(UserRole.ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
        }
    }
}