package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when the system cannot find the student profile associated
 * with a specific user.
 */
public class StudentProfileNotFoundException extends RuntimeException {

    /**
     * Creates the exception including the email of the user whose student
     * profile could not be found.
     *
     * @param email email of the user associated with the missing student profile
     */
    public StudentProfileNotFoundException(String email) {
        super("Student profile not found for user " + email);
    }
}