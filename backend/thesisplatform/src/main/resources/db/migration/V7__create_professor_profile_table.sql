CREATE TABLE professor_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    available_to_supervise BOOLEAN NOT NULL,
    max_phd_students INTEGER,
    additional_information TEXT,
    cv_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_professor_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);