package es.upm.tfg.thesisplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Spring configuration class responsible for exposing the password encoder bean
 * used across the application.
 *
 * <p>
 * The platform uses BCrypt to securely hash user passwords before storing
 * them in the database.
 * </p>
 */
@Configuration
public class PasswordConfig {

    /**
     * Creates the password encoder used for password hashing and verification.
     *
     * @return BCrypt-based password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}