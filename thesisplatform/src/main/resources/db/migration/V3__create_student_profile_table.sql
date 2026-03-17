CREATE TABLE student_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    origin_institution VARCHAR(255) NOT NULL,
    motivation TEXT NOT NULL,
    proposed_thesis_title VARCHAR(255) NOT NULL,
    has_funding BOOLEAN NOT NULL,
    funding_type VARCHAR(100),
    funding_duration_months INTEGER,
    willing_to_relocate_to_madrid BOOLEAN NOT NULL,
    dedication_type VARCHAR(50) NOT NULL,
    additional_information TEXT,
    cv_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);