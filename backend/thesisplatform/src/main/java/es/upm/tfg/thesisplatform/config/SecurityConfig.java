package es.upm.tfg.thesisplatform.config;

import es.upm.tfg.thesisplatform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Main security configuration of the application.
 *
 * <p>
 * This class configures Spring Security to work with a stateless JWT-based
 * authentication model, defines which endpoints are publicly accessible and
 * registers the custom JWT authentication filter in the security chain.
 * </p>
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Custom filter responsible for extracting and validating JWT tokens from
     * requests.
     */
    private final JwtAuthenticationFilter jwtAuthFilter;

    /**
     * Builds the main Spring Security filter chain.
     *
     * <p>
     * The configuration disables CSRF protection for the stateless API,
     * enables CORS handling, allows unauthenticated access to authentication,
     * catalog and file endpoints, and requires authentication for all other
     * requests.
     * </p>
     *
     * @param http {@link HttpSecurity} object used to configure web security
     * @return configured security filter chain
     * @throws Exception if the security chain cannot be built
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/files/**").permitAll()
                        .requestMatchers("/api/catalog/**").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}