package es.upm.tfg.thesisplatform.auth.service;

import es.upm.tfg.thesisplatform.auth.dto.AuthResponse;
import es.upm.tfg.thesisplatform.auth.dto.LoginRequest;
import es.upm.tfg.thesisplatform.auth.dto.RegisterRequest;
import es.upm.tfg.thesisplatform.auth.dto.RegisterResponse;
import es.upm.tfg.thesisplatform.exception.EmailAlreadyExistsException;
import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.InvalidCredentialsException;
import es.upm.tfg.thesisplatform.security.JwtService;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service responsible for account registration and authentication.
 *
 * <p>
 * This service encapsulates the business rules related to self-registration,
 * credential validation and JWT token generation for authenticated users.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    /**
     * Repository used to access and persist user accounts.
     */
    private final UserRepository userRepository;

    /**
     * Component used to hash plain-text passwords before persistence and to
     * verify submitted passwords during authentication.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Service used to generate JWT tokens after successful authentication.
     */
    private final JwtService jwtService;

    /**
     * Registers a new account in the platform.
     *
     * <p>
     * The email is normalized before validation and persistence. Self-registration
     * is restricted to student and professor roles.
     * </p>
     *
     * @param request registration data submitted by the client
     * @return response DTO containing the created account data
     * @throws EmailAlreadyExistsException if another account already uses the same
     *                                     email
     * @throws ForbiddenOperationException if the requested role is not allowed for
     *                                     self-registration
     */
    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }

        if (request.getRole() == null ||
                (request.getRole() != UserRole.STUDENT && request.getRole() != UserRole.PROFESSOR)) {
            throw new ForbiddenOperationException("Only STUDENT or PROFESSOR roles are allowed for self-registration");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .active(savedUser.isActive())
                .build();
    }

    /**
     * Authenticates a user with email and password credentials.
     *
     * <p>
     * If the credentials are valid and the account is active, a JWT token is
     * generated and returned together with the account information.
     * </p>
     *
     * @param request login credentials submitted by the client
     * @return authentication response containing the JWT token
     * @throws InvalidCredentialsException if the email does not exist or the
     *                                     password is incorrect
     * @throws ForbiddenOperationException if the account exists but is deactivated
     */
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new ForbiddenOperationException("User account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .token(token)
                .build();
    }
}