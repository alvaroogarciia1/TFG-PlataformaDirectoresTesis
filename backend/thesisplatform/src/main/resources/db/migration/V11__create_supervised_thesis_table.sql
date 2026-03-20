CREATE TABLE supervised_thesis (
    id BIGSERIAL PRIMARY KEY,
    professor_profile_id BIGINT NOT NULL,
    doctoral_student_name VARCHAR(255) NOT NULL,
    thesis_title VARCHAR(500) NOT NULL,
    defense_year INTEGER,
    research_description TEXT,
    industrial_mention BOOLEAN NOT NULL DEFAULT FALSE,
    international_mention BOOLEAN NOT NULL DEFAULT FALSE,
    results TEXT,
    ongoing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_supervised_thesis_professor_profile
        FOREIGN KEY (professor_profile_id) REFERENCES professor_profile(id) ON DELETE CASCADE
);