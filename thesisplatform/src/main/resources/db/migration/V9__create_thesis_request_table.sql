CREATE TABLE thesis_request (
    id BIGSERIAL PRIMARY KEY,
    student_user_id BIGINT NOT NULL,
    professor_user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_thesis_request_student
        FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_thesis_request_professor
        FOREIGN KEY (professor_user_id) REFERENCES users(id) ON DELETE CASCADE
);