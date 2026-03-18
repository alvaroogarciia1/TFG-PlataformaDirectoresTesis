package es.upm.tfg.thesisplatform.exception;

public class ProfessorProfileNotFoundException extends RuntimeException {

    public ProfessorProfileNotFoundException(String email) {
        super("Professor profile not found for user " + email);
    }
}