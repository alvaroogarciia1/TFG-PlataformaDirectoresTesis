package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when a registration attempt is made using an email address
 * that is already associated with an existing account.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    /**
     * Creates the exception with a message including the conflicting email address.
     *
     * @param email email address that already exists in the system
     */
    public EmailAlreadyExistsException(String email) {
        super("A user with email " + email + " already exists");
    }
}