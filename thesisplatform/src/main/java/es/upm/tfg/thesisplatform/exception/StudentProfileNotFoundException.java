package es.upm.tfg.thesisplatform.exception;

public class StudentProfileNotFoundException extends RuntimeException {

    public StudentProfileNotFoundException(String email) {
        super("Student profile not found for user " + email);
    }
}