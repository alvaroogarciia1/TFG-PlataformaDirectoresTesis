package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when a supervised thesis record cannot be found.
 */
public class SupervisedThesisNotFoundException extends RuntimeException {

    /**
     * Creates the exception including the identifier of the missing supervised
     * thesis.
     *
     * @param id identifier of the supervised thesis that was not found
     */
    public SupervisedThesisNotFoundException(Long id) {
        super("Supervised thesis not found with id " + id);
    }
}