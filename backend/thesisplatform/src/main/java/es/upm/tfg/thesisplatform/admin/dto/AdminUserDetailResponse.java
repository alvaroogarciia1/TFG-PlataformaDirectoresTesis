package es.upm.tfg.thesisplatform.admin.dto;

import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class AdminUserDetailResponse {

    private Long id;
    private String email;
    private UserRole role;
    private boolean active;
    private String fullName;

    private StudentProfileResponse studentProfile;
    private ProfessorProfileResponse professorProfile;
}