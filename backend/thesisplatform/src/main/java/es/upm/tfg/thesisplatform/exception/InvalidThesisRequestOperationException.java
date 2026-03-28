package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when an invalid business operation is attempted over a
 * thesis request, such as an unauthorized or inconsistent state transition.
 */
public class InvalidThesisRequestOperationException extends RuntimeException {

    /**
     * Creates the exception with a custom explanatory message.
     *
     * @param message detail describing the invalid thesis request operation
     */
    public InvalidThesisRequestOperationException(String message) {
        super(message);
    }
}