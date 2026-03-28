package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when the current user attempts to perform an operation that
 * is not allowed according to the business rules or access restrictions.
 */
public class ForbiddenOperationException extends RuntimeException {

    /**
     * Creates the exception with a custom explanatory message.
     *
     * @param message detail describing why the operation is forbidden
     */
    public ForbiddenOperationException(String message) {
        super(message);
    }
}