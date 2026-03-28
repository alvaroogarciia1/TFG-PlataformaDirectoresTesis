package es.upm.tfg.thesisplatform.exception;

/**
 * Generic exception thrown when a requested resource does not exist in the
 * system.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Creates the exception with a custom explanatory message.
     *
     * @param message detail describing the missing resource
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}