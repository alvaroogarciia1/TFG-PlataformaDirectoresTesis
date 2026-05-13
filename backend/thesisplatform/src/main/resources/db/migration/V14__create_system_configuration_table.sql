CREATE TABLE system_configuration (
    id BIGSERIAL PRIMARY KEY,
    backend_base_url VARCHAR(255) NOT NULL,
    frontend_base_url VARCHAR(255) NOT NULL,
    reset_password_url VARCHAR(255) NOT NULL,
    mail_from VARCHAR(255) NOT NULL,
    upload_dir VARCHAR(255) NOT NULL,
    jwt_expiration BIGINT NOT NULL
);

INSERT INTO system_configuration (
    backend_base_url,
    frontend_base_url,
    reset_password_url,
    mail_from,
    upload_dir,
    jwt_expiration
)
VALUES (
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:3000/reset-password',
    'tfgplataforma04@gmail.com',
    'uploads',
    86400000
);