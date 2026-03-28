package es.upm.tfg.thesisplatform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that intercepts incoming HTTP requests to extract and validate JWT
 * tokens.
 *
 * <p>
 * If a valid bearer token is found in the {@code Authorization} header, the
 * corresponding user is loaded and the Spring Security context is populated
 * with
 * an authenticated principal.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Service responsible for extracting and validating JWT information.
     */
    private final JwtService jwtService;

    /**
     * Service used to load user details associated with the token subject.
     */
    private final CustomUserDetailsService userDetailsService;

    /**
     * Processes the incoming request, attempts JWT-based authentication and
     * continues the filter chain.
     *
     * @param request     current HTTP request
     * @param response    current HTTP response
     * @param filterChain filter chain to continue processing
     * @throws ServletException if a servlet-related error occurs
     * @throws IOException      if an input/output error occurs
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (userDetails.isEnabled() && jwtService.isTokenValid(token, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            // Invalid token, expired token or missing user.
            // The request continues without authentication.
        }

        filterChain.doFilter(request, response);
    }
}