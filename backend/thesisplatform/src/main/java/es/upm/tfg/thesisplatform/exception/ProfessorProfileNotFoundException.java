package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when the system cannot find the professor profile associated
 * with a specific user.
 */
public class ProfessorProfileNotFoundException extends RuntimeException {

    /**
     * Creates the exception including the email of the user whose professor
     * profile could not be found.
     *
     * @param email email of the user associated with the missing professor profile
     */
    public ProfessorProfileNotFoundException(String email) {
        super("Professor profile not found for user " + email);
    }
}