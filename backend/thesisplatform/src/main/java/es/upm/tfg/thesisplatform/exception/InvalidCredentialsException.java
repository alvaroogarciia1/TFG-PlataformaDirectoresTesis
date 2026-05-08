package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when user authentication fails because the provided email
 * or password is incorrect.
 */
public class InvalidCredentialsException extends RuntimeException {

    /**
     * Creates the exception with the default invalid-credentials message.
     */
    public InvalidCredentialsException() {
        super("El correo o la contraseña introducidos son incorrectos");
    }
}