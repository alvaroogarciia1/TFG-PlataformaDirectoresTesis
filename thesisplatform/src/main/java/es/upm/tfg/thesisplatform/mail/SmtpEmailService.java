package es.upm.tfg.thesisplatform.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

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
}