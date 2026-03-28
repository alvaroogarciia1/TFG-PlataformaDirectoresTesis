package es.upm.tfg.thesisplatform.security;

import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

/**
 * Spring Security service responsible for loading user details from the
 * database.
 *
 * <p>
 * This implementation adapts the application's {@code User} entity to the
 * {@link UserDetails} contract required by Spring Security.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /**
     * Repository used to retrieve users by email.
     */
    private final UserRepository userRepository;

    /**
     * Loads a user by email and converts it into a Spring Security
     * {@link UserDetails} instance.
     *
     * @param email email address used as username in the authentication process
     * @return Spring Security user details object
     * @throws UsernameNotFoundException if no user exists with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .disabled(!user.isActive())
                .build();
    }
}