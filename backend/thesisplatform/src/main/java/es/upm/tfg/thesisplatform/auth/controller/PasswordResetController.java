package es.upm.tfg.thesisplatform.auth.controller;

import es.upm.tfg.thesisplatform.auth.dto.ForgotPasswordRequest;
import es.upm.tfg.thesisplatform.auth.dto.ResetPasswordRequest;
import es.upm.tfg.thesisplatform.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller responsible for password recovery operations.
 *
 * <p>
 * It provides the endpoints required to request a password reset token and
 * to establish a new password using a valid token.
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    /**
     * Service layer that manages password reset requests and token validation.
     */
    private final PasswordResetService passwordResetService;

    /**
     * Generates and sends a password reset token to the user's email address
     * when the account exists.
     *
     * @param request request containing the email address associated with the
     *                account
     */
    @PostMapping("/forgot-password")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);
    }

    /**
     * Resets the user's password using a valid non-expired token.
     *
     * @param request request containing the reset token and the new password
     */
    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
    }
}