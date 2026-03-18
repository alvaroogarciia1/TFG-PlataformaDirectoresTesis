package es.upm.tfg.thesisplatform.mail;

public interface EmailService {
    void sendPasswordResetEmail(String to, String resetToken);
}