package es.upm.tfg.thesisplatform.exception;

/**
 * Exception thrown when an uploaded file does not meet the expected validation
 * criteria, such as format, size or content restrictions.
 */
public class InvalidFileException extends RuntimeException {

    /**
     * Creates the exception with a custom explanatory message.
     *
     * @param message detail describing why the file is considered invalid
     */
    public InvalidFileException(String message) {
        super(message);
    }
}