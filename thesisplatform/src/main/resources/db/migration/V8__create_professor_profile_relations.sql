CREATE TABLE professor_profile_doctoral_program (
    professor_profile_id BIGINT NOT NULL,
    doctoral_program_id BIGINT NOT NULL,

    PRIMARY KEY (professor_profile_id, doctoral_program_id),

    FOREIGN KEY (professor_profile_id) REFERENCES professor_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (doctoral_program_id) REFERENCES doctoral_program(id) ON DELETE CASCADE
);

CREATE TABLE professor_profile_research_line (
    professor_profile_id BIGINT NOT NULL,
    research_line_id BIGINT NOT NULL,

    PRIMARY KEY (professor_profile_id, research_line_id),

    FOREIGN KEY (professor_profile_id) REFERENCES professor_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (research_line_id) REFERENCES research_line(id) ON DELETE CASCADE
);