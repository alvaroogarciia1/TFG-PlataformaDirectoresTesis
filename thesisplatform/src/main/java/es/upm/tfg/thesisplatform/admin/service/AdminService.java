package es.upm.tfg.thesisplatform.admin.service;

import es.upm.tfg.thesisplatform.admin.dto.AdminUserDetailResponse;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSearchRequest;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSummaryResponse;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import es.upm.tfg.thesisplatform.thesisrequest.service.ThesisRequestService;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProfessorProfileRepository professorProfileRepository;
    private final ThesisRequestService thesisRequestService;

    public List<AdminUserSummaryResponse> searchUsers(AdminUserSearchRequest request) {
        String query = normalize(request.getQuery());

        return userRepository.findAll().stream()
                .map(this::mapUserSummary)
                .filter(user -> query == null
                        || containsIgnoreCase(user.getEmail(), query)
                        || containsIgnoreCase(user.getFullName(), query))
                .filter(user -> request.getRole() == null || user.getRole() == request.getRole())
                .filter(user -> request.getActive() == null || user.isActive() == request.getActive())
                .toList();
    }

    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfile studentProfile = studentProfileRepository.findByUserId(userId).orElse(null);
        ProfessorProfile professorProfile = professorProfileRepository.findByUserId(userId).orElse(null);

        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .fullName(resolveFullName(user, studentProfile, professorProfile))
                .studentProfile(studentProfile != null ? mapStudentProfile(studentProfile) : null)
                .professorProfile(professorProfile != null ? mapProfessorProfile(professorProfile) : null)
                .build();
    }

    public AdminUserSummaryResponse activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setActive(true);
        User saved = userRepository.save(user);

        return mapUserSummary(saved);
    }

    public AdminUserSummaryResponse deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setActive(false);
        User saved = userRepository.save(user);

        return mapUserSummary(saved);
    }

    public List<ThesisRequestResponse> getAllRequests() {
        return thesisRequestService.getAllRequestsForAdmin();
    }

    private AdminUserSummaryResponse mapUserSummary(User user) {
        StudentProfile studentProfile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        ProfessorProfile professorProfile = professorProfileRepository.findByUserId(user.getId()).orElse(null);

        return AdminUserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .fullName(resolveFullName(user, studentProfile, professorProfile))
                .build();
    }

    private String resolveFullName(User user, StudentProfile studentProfile, ProfessorProfile professorProfile) {
        if (studentProfile != null) {
            return studentProfile.getFirstName() + " " + studentProfile.getLastName();
        }

        if (professorProfile != null) {
            return professorProfile.getFirstName() + " " + professorProfile.getLastName();
        }

        return user.getEmail();
    }

    private StudentProfileResponse mapStudentProfile(StudentProfile profile) {
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .email(profile.getUser().getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .originInstitution(profile.getOriginInstitution())
                .motivation(profile.getMotivation())
                .proposedThesisTitle(profile.getProposedThesisTitle())
                .hasFunding(profile.isHasFunding())
                .fundingType(profile.getFundingType())
                .fundingDurationMonths(profile.getFundingDurationMonths())
                .willingToRelocateToMadrid(profile.isWillingToRelocateToMadrid())
                .dedicationType(profile.getDedicationType())
                .additionalInformation(profile.getAdditionalInformation())
                .cvUrl(profile.getCvUrl())
                .doctoralPrograms(
                        profile.getDoctoralPrograms().stream()
                                .map(p -> p.getName())
                                .toList())
                .researchLines(
                        profile.getResearchLines().stream()
                                .map(r -> r.getName())
                                .toList())
                .build();
    }

    private ProfessorProfileResponse mapProfessorProfile(ProfessorProfile profile) {
        return ProfessorProfileResponse.builder()
                .id(profile.getId())
                .email(profile.getUser().getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .institution(profile.getInstitution())
                .department(profile.getDepartment())
                .availableToSupervise(profile.isAvailableToSupervise())
                .maxPhdStudents(profile.getMaxPhdStudents())
                .additionalInformation(profile.getAdditionalInformation())
                .cvUrl(profile.getCvUrl())
                .doctoralPrograms(
                        profile.getDoctoralPrograms().stream()
                                .map(p -> p.getName())
                                .toList())
                .researchLines(
                        profile.getResearchLines().stream()
                                .map(r -> r.getName())
                                .toList())
                .build();
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim().toLowerCase();
    }

    private boolean containsIgnoreCase(String source, String query) {
        return source != null && source.toLowerCase().contains(query);
    }
}