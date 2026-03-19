package es.upm.tfg.thesisplatform.exception;

public class SupervisedThesisNotFoundException extends RuntimeException {

    public SupervisedThesisNotFoundException(Long id) {
        super("Supervised thesis not found with id " + id);
    }
}