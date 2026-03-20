CREATE TABLE student_profile_doctoral_program (
    student_profile_id BIGINT NOT NULL,
    doctoral_program_id BIGINT NOT NULL,

    PRIMARY KEY (student_profile_id, doctoral_program_id),

    FOREIGN KEY (student_profile_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (doctoral_program_id) REFERENCES doctoral_program(id) ON DELETE CASCADE
);

CREATE TABLE student_profile_research_line (
    student_profile_id BIGINT NOT NULL,
    research_line_id BIGINT NOT NULL,

    PRIMARY KEY (student_profile_id, research_line_id),

    FOREIGN KEY (student_profile_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (research_line_id) REFERENCES research_line(id) ON DELETE CASCADE
);