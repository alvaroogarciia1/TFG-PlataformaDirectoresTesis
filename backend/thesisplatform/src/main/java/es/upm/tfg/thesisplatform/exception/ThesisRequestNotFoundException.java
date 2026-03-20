package es.upm.tfg.thesisplatform.exception;

public class ThesisRequestNotFoundException extends RuntimeException {

    public ThesisRequestNotFoundException(Long id) {
        super("Thesis request not found with id " + id);
    }
}