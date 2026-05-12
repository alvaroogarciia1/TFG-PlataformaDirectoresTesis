package es.upm.tfg.thesisplatform.config.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "system_configuration")
public class SystemConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "backend_base_url", nullable = false)
    private String backendBaseUrl;

    @Column(name = "frontend_base_url", nullable = false)
    private String frontendBaseUrl;

    @Column(name = "reset_password_url", nullable = false)
    private String resetPasswordUrl;

    @Column(name = "mail_from", nullable = false)
    private String mailFrom;

    @Column(name = "upload_dir", nullable = false)
    private String uploadDir;

    @Column(name = "jwt_expiration", nullable = false)
    private Long jwtExpiration;

    public SystemConfiguration() {
    }

    public Long getId() {
        return id;
    }

    public String getBackendBaseUrl() {
        return backendBaseUrl;
    }

    public void setBackendBaseUrl(String backendBaseUrl) {
        this.backendBaseUrl = backendBaseUrl;
    }

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public String getResetPasswordUrl() {
        return resetPasswordUrl;
    }

    public void setResetPasswordUrl(String resetPasswordUrl) {
        this.resetPasswordUrl = resetPasswordUrl;
    }

    public String getMailFrom() {
        return mailFrom;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public Long getJwtExpiration() {
        return jwtExpiration;
    }

    public void setJwtExpiration(Long jwtExpiration) {
        this.jwtExpiration = jwtExpiration;
    }
}