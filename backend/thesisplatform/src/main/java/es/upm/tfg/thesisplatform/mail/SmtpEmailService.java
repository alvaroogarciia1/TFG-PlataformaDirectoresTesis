package es.upm.tfg.thesisplatform.mail;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
     * Public URL of the ThesisMatch logo used in email templates.
     */
    private static final String LOGO_URL =
            "https://drive.google.com/uc?export=view&id=1CgQDqWUGG6QGh0albUbLMY_lagns79iZ";

    /**
     * Sends a password recovery email containing the reset link with the token.
     *
     * @param to         recipient email address
     * @param resetToken unique token generated for password recovery
     */
    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetLink = resetPasswordBaseUrl + "?token=" + resetToken;

        String subject = "[ThesisMatch] Recuperación de contraseña";

        String body = buildTemplate(
                "Recuperación de contraseña",
                "Hemos recibido una solicitud para restablecer tu contraseña.",
                "<p>Hemos recibido una solicitud para restablecer tu contraseña.</p>" +
                        "<p>Pulsa en el siguiente enlace:</p>" +
                        "<p><a href=\"" + resetLink + "\" " +
                        "style=\"display:inline-block;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;\">" +
                        "Restablecer contraseña</a></p>" +
                        "<p>Si no has solicitado este cambio, puedes ignorar este mensaje.</p>");

        sendHtmlEmail(to, subject, body);
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
        String finalSubject = "[ThesisMatch] " + subject;

        String normalizedBody = body
                .replaceFirst("(?i)^Hola,?\\s*", "")
                .trim();

        String htmlBody = buildTemplate(
                subject,
                "Notificación de la plataforma ThesisMatch.",
                "<p>" + normalizedBody.replace("\n", "<br/>") + "</p>");

        sendHtmlEmail(to, finalSubject, htmlBody);
    }

    /**
     * Builds the base HTML template used for platform emails.
     *
     * @param title    main title of the email
     * @param subtitle subtitle shown below the title
     * @param content  main HTML content of the email body
     * @return complete HTML email body
     */
    private String buildTemplate(String title, String subtitle, String content) {
        return """
                <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 24px;">
                    
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="%s" alt="ThesisMatch" style="max-width: 220px; height: auto;" />
                    </div>
                
                    <h2 style="margin: 0 0 8px 0; color: #0f172a;">%s</h2>
                    <p style="margin: 0 0 20px 0; color: #6b7280;">%s</p>
                
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                        <p style="margin-top: 0;">Hola,</p>
                        %s
                    </div>
                
                    <p style="margin-top: 24px;">Puedes acceder a la plataforma para más información.</p>
                
                    <p style="margin-top: 32px;">
                        Un saludo,<br/>
                        <strong>ThesisMatch</strong>
                    </p>
                
                    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
                
                    <p style="font-size: 12px; color: #9ca3af;">
                        Este correo ha sido generado automáticamente por ThesisMatch. Por favor, no respondas a este mensaje.
                    </p>
                </div>
                """.formatted(LOGO_URL, title, subtitle, content);
    }

    /**
     * Sends an HTML email with the provided subject and body.
     *
     * @param to       recipient email address
     * @param subject  subject of the email
     * @param htmlBody HTML body content
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }
}