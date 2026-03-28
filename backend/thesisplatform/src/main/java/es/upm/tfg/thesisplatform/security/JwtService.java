package es.upm.tfg.thesisplatform.security;

import es.upm.tfg.thesisplatform.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for JWT generation, claim extraction and token
 * validation.
 *
 * <p>
 * This component encapsulates the interaction with the JWT library and
 * centralizes all token-related operations used by the authentication layer.
 * </p>
 */
@Service
public class JwtService {

    /**
     * Secret key used to sign and verify JWT tokens.
     */
    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * Token expiration time in milliseconds.
     */
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Generates a signed JWT token for the given user.
     *
     * <p>
     * The token includes the user's role as an additional claim and uses the
     * user's email as the token subject.
     * </p>
     *
     * @param user authenticated user for whom the token is generated
     * @return signed JWT token
     */
    public String generateToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());

        return buildToken(extraClaims, user.getEmail(), jwtExpiration);
    }

    /**
     * Extracts the username, represented by the subject claim, from the token.
     *
     * @param token JWT token
     * @return username stored in the token subject
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts a specific claim from the token using the provided resolver.
     *
     * @param token          JWT token
     * @param claimsResolver function that selects the desired claim
     * @param <T>            type of the extracted claim
     * @return extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Validates whether the token belongs to the expected user and is not expired.
     *
     * @param token JWT token to validate
     * @param email expected email address of the authenticated user
     * @return {@code true} if the token is valid for the given email; {@code false}
     *         otherwise
     */
    public boolean isTokenValid(String token, String email) {
        String username = extractUsername(token);
        return username.equals(email) && !isTokenExpired(token);
    }

    /**
     * Builds a signed JWT token with the given claims, subject and expiration time.
     *
     * @param extraClaims additional claims to include in the token
     * @param subject     token subject
     * @param expiration  token lifetime in milliseconds
     * @return signed JWT token
     */
    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Determines whether the token has already expired.
     *
     * @param token JWT token
     * @return {@code true} if the token is expired; {@code false} otherwise
     */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Extracts all claims contained in the token after signature verification.
     *
     * @param token JWT token
     * @return token claims payload
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Builds the cryptographic signing key from the configured base64 secret.
     *
     * @return signing key used for JWT signature and verification
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}