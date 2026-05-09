package es.upm.tfg.thesisplatform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global REST exception handler for the application.
 *
 * <p>
 * This component centralizes the translation of domain and validation
 * exceptions into standardized HTTP error responses using
 * {@link ProblemDetail},
 * improving consistency across the API.
 * </p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles duplicated email registration attempts.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 409 status
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ProblemDetail handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                ex.getMessage());
        problemDetail.setTitle("Email already exists");
        return problemDetail;
    }

    /**
     * Handles malformed request bodies or invalid enum values.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 400 status
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String detail = "Request body is invalid. Check JSON format and field values.";

        if (ex.getMessage() != null && ex.getMessage().contains("UserRole")) {
            detail = "Invalid role. Allowed values are: STUDENT, PROFESSOR, ADMIN.";
        }

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                detail);
        problemDetail.setTitle("Invalid role");
        return problemDetail;
    }

    /**
     * Handles authentication failures caused by incorrect credentials.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 401 status
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage());
        problemDetail.setTitle("Invalid credentials");
        return problemDetail;
    }

    /**
     * Handles cases where a student profile cannot be found.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 404 status
     */
    @ExceptionHandler(StudentProfileNotFoundException.class)
    public ProblemDetail handleStudentProfileNotFound(StudentProfileNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage());
        problemDetail.setTitle("Student profile not found");
        return problemDetail;
    }

    /**
     * Handles operations that are not permitted by the application rules.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 403 status
     */
    @ExceptionHandler(ForbiddenOperationException.class)
    public ProblemDetail handleForbiddenOperation(ForbiddenOperationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN,
                ex.getMessage());
        problemDetail.setTitle("Forbidden operation");
        return problemDetail;
    }

    /**
     * Handles generic not-found situations for resources in the system.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 404 status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage());
        problemDetail.setTitle("Resource not found");
        return problemDetail;
    }

    /**
     * Handles cases where a professor profile cannot be found.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 404 status
     */
    @ExceptionHandler(ProfessorProfileNotFoundException.class)
    public ProblemDetail handleProfessorProfileNotFound(ProfessorProfileNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage());
        problemDetail.setTitle("Professor profile not found");
        return problemDetail;
    }

    /**
     * Handles cases where a thesis request cannot be found.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 404 status
     */
    @ExceptionHandler(ThesisRequestNotFoundException.class)
    public ProblemDetail handleThesisRequestNotFound(ThesisRequestNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage());
        problemDetail.setTitle("Thesis request not found");
        return problemDetail;
    }

    /**
     * Handles invalid operations over thesis requests.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 400 status
     */
    @ExceptionHandler(InvalidThesisRequestOperationException.class)
    public ProblemDetail handleInvalidThesisRequestOperation(InvalidThesisRequestOperationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage());
        problemDetail.setTitle("Invalid thesis request operation");
        return problemDetail;
    }

    /**
     * Handles invalid, expired or already used password reset tokens.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 400 status
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ProblemDetail handleInvalidToken(InvalidTokenException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage());
        problemDetail.setTitle("Invalid or expired token");
        return problemDetail;
    }

    /**
     * Handles cases where a supervised thesis cannot be found.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 404 status
     */
    @ExceptionHandler(SupervisedThesisNotFoundException.class)
    public ProblemDetail handleSupervisedThesisNotFound(SupervisedThesisNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage());
        problemDetail.setTitle("Supervised thesis not found");
        return problemDetail;
    }

    /**
     * Handles invalid file upload or file validation errors.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 400 status
     */
    @ExceptionHandler(InvalidFileException.class)
    public ProblemDetail handleInvalidFile(InvalidFileException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage());
        problemDetail.setTitle("Invalid file");
        return problemDetail;
    }

    /**
     * Handles bean validation errors produced by invalid request DTO fields.
     *
     * <p>
     * The response includes an additional {@code errors} property containing
     * the field-by-field validation messages.
     * </p>
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 400 status and field errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Validation error");
        problemDetail.setDetail("One or more fields are invalid.");

        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        problemDetail.setProperty("errors", errors);
        return problemDetail;
    }

    /**
     * Handles access denied errors produced when an authenticated user attempts
     * to access a resource without the required permissions.
     *
     * @param ex thrown exception
     * @return problem detail response with HTTP 403 status
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ProblemDetail handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        problemDetail.setTitle("Access denied");
        problemDetail.setDetail("You do not have permission to access this resource.");

        return problemDetail;
    }

    /**
     * Handles unexpected exceptions not covered by more specific handlers.
     *
     * <p>
     * This method prevents internal implementation details from being exposed
     * to the client when an unhandled error occurs.
     * </p>
     *
     * @param ex unexpected exception
     * @return generic internal server error response
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problemDetail.setTitle("Internal server error");
        problemDetail.setDetail("Unexpected error occurred");
        return problemDetail;
    }
}