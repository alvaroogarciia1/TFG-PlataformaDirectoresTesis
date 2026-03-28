package es.upm.tfg.thesisplatform.mail;

/**
 * Abstraction for the email delivery service used by the platform.
 *
 * <p>
 * This interface defines the email operations required by the system, such
 * as password recovery messages and generic notification emails.
 * </p>
 */
public interface EmailService {

    /**
     * Sends a password reset email to the target recipient.
     *
     * @param to         recipient email address
     * @param resetToken unique token used to reset the password
     */
    void sendPasswordResetEmail(String to, String resetToken);

    /**
     * Sends a generic email with custom subject and body.
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param body    email body content
     */
    void sendGenericEmail(String to, String subject, String body);
}