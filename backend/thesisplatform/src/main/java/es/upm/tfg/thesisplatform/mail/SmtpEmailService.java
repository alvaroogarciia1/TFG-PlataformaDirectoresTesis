package es.upm.tfg.thesisplatform.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * SMTP-based implementation of {@link EmailService}.
 *
 * <p>
 * This service delegates email delivery to Spring's {@link JavaMailSender}
 * and is responsible for composing the messages required by the application.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    /**
     * Spring component used to send emails through the configured SMTP server.
     */
    private final JavaMailSender mailSender;

    /**
     * Sender email address configured for outgoing messages.
     */
    @Value("${app.mail.from}")
    private String from;

    /**
     * Frontend base URL used to build the password reset link sent to users.
     */
    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    /**
     * Sends a password recovery email containing the reset link with the token.
     *
     * @param to         recipient email address
     * @param resetToken unique token generated for password recovery
     */
    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetLink = resetPasswordBaseUrl + "?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Recuperación de contraseña");
        message.setText(
                "Hola,\n\n" +
                        "Hemos recibido una solicitud para restablecer tu contraseña.\n" +
                        "Pulsa en este enlace:\n\n" +
                        resetLink + "\n\n" +
                        "Si no has solicitado este cambio, ignora este mensaje.");

        mailSender.send(message);
    }

    /**
     * Sends a generic email with the provided subject and body.
     *
     * @param to      recipient email address
     * @param subject subject of the email
     * @param body    body content of the email
     */
    @Override
    public void sendGenericEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}