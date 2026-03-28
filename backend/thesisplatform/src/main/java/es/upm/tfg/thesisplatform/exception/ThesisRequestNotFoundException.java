package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when a thesis request cannot be found in the system.
 */
public class ThesisRequestNotFoundException extends RuntimeException {

    /**
     * Creates the exception including the identifier of the missing thesis request.
     *
     * @param id identifier of the thesis request that was not found
     */
    public ThesisRequestNotFoundException(Long id) {
        super("Thesis request not found with id " + id);
    }
}