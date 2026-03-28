package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when a token is invalid, expired or no longer usable.
 *
 * <p>
 * It is primarily used in the password reset flow.
 * </p>
 */
public class InvalidTokenException extends RuntimeException {

    /**
     * Creates the exception with a custom explanatory message.
     *
     * @param message detail describing the token validation problem
     */
    public InvalidTokenException(String message) {
        super(message);
    }
}