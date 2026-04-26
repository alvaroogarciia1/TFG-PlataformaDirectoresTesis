package es.upm.tfg.thesisplatform.admin.service;

import es.upm.tfg.thesisplatform.admin.dto.AdminUserDetailResponse;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSearchRequest;
import es.upm.tfg.thesisplatform.admin.dto.AdminUserSummaryResponse;
import es.upm.tfg.thesisplatform.auth.repository.PasswordResetTokenRepository;
import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisResponse;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import es.upm.tfg.thesisplatform.thesisrequest.repository.ThesisRequestRepository;
import es.upm.tfg.thesisplatform.thesisrequest.service.ThesisRequestService;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service responsible for the business logic associated with platform
 * administration.
 *
 * <p>
 * This service centralizes user supervision tasks such as searching users,
 * retrieving detailed account information, activating or deactivating accounts,
 * listing thesis requests and deleting non-administrative users together with
 * their dependent information.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AdminService {

        /**
         * Repository used to access user accounts.
         */
        private final UserRepository userRepository;

        /**
         * Repository used to access student profiles.
         */
        private final StudentProfileRepository studentProfileRepository;

        /**
         * Repository used to access professor profiles.
         */
        private final ProfessorProfileRepository professorProfileRepository;

        /**
         * Service used to retrieve thesis request information for administrative views.
         */
        private final ThesisRequestService thesisRequestService;

        /**
         * Repository used to manage password reset tokens associated with users.
         */
        private final PasswordResetTokenRepository passwordResetTokenRepository;

        /**
         * Repository used for direct thesis request deletion operations.
         */
        private final ThesisRequestRepository thesisRequestRepository;

        /**
         * Searches non-administrative users using optional text, role and active-status
         * filters.
         *
         * <p>
         * The method first normalizes the search text, excludes administrative
         * accounts from the results and then applies the requested filters over
         * the mapped summary representation.
         * </p>
         *
         * @param request search criteria provided by the administrator
         * @return list of users matching the requested filters
         */
        public List<AdminUserSummaryResponse> searchUsers(AdminUserSearchRequest request) {
                String query = normalize(request.getQuery());

                if (request.getRole() == UserRole.ADMIN) {
                        return List.of();
                }

                return userRepository.findAll().stream()
                                .filter(user -> user.getRole() != UserRole.ADMIN)
                                .map(this::mapUserSummary)
                                .filter(user -> query == null
                                                || containsIgnoreCase(user.getEmail(), query)
                                                || containsIgnoreCase(user.getFullName(), query))
                                .filter(user -> request.getRole() == null || user.getRole() == request.getRole())
                                .filter(user -> request.getActive() == null || user.isActive() == request.getActive())
                                .toList();
        }

        /**
         * Retrieves the detailed administrative representation of a user.
         *
         * <p>
         * The response includes account data and, when available, the fully
         * loaded student or professor profile associated with the user.
         * </p>
         *
         * @param userId identifier of the user to retrieve
         * @return detailed response containing account and profile information
         * @throws ResourceNotFoundException if the user does not exist
         */
        @Transactional(readOnly = true)
        public AdminUserDetailResponse getUserDetail(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                StudentProfile studentProfile = studentProfileRepository.findDetailedByUserId(userId).orElse(null);
                ProfessorProfile professorProfile = professorProfileRepository.findDetailedByUserId(userId)
                                .orElse(null);

                return AdminUserDetailResponse.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .active(user.isActive())
                                .fullName(resolveFullName(user, studentProfile, professorProfile))
                                .studentProfile(studentProfile != null ? mapStudentProfile(studentProfile) : null)
                                .professorProfile(
                                                professorProfile != null ? mapProfessorProfile(professorProfile) : null)
                                .build();
        }

        /**
         * Activates a non-administrative user account.
         *
         * @param userId identifier of the user to activate
         * @return summarized representation of the updated user
         * @throws ResourceNotFoundException   if the user does not exist
         * @throws ForbiddenOperationException if the target user is an administrator
         */
        public AdminUserSummaryResponse activateUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getRole() == UserRole.ADMIN) {
                        throw new ForbiddenOperationException("Admin accounts cannot be modified from this panel");
                }

                user.setActive(true);
                User saved = userRepository.save(user);

                return mapUserSummary(saved);
        }

        /**
         * Deactivates a non-administrative user account.
         *
         * @param userId identifier of the user to deactivate
         * @return summarized representation of the updated user
         * @throws ResourceNotFoundException   if the user does not exist
         * @throws ForbiddenOperationException if the target user is an administrator
         */
        public AdminUserSummaryResponse deactivateUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getRole() == UserRole.ADMIN) {
                        throw new ForbiddenOperationException("Admin accounts cannot be modified from this panel");
                }

                user.setActive(false);
                User saved = userRepository.save(user);

                return mapUserSummary(saved);
        }

        /**
         * Retrieves all thesis requests visible to the administrator.
         *
         * @return list of thesis request responses
         */
        public List<ThesisRequestResponse> getAllRequests() {
                return thesisRequestService.getAllRequestsForAdmin();
        }

        /**
         * Maps a {@link User} entity to its summarized administrative representation.
         *
         * <p>
         * The method resolves the user's full name from the corresponding
         * academic profile when available.
         * </p>
         *
         * @param user user entity to map
         * @return summarized response DTO
         */
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

        /**
         * Resolves the most appropriate full name for a user.
         *
         * <p>
         * If a student profile exists, its name is used. Otherwise, if a
         * professor profile exists, that name is used. As a fallback, the
         * account email is returned.
         * </p>
         *
         * @param user             base user entity
         * @param studentProfile   associated student profile, if any
         * @param professorProfile associated professor profile, if any
         * @return resolved full name or fallback email
         */
        private String resolveFullName(User user, StudentProfile studentProfile, ProfessorProfile professorProfile) {
                if (studentProfile != null) {
                        return studentProfile.getFirstName() + " " + studentProfile.getLastName();
                }

                if (professorProfile != null) {
                        return professorProfile.getFirstName() + " " + professorProfile.getLastName();
                }

                return user.getEmail();
        }

        /**
         * Maps a student profile entity to the response DTO used in administrative
         * detail views.
         *
         * @param profile student profile entity
         * @return mapped student profile response
         */
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

        /**
         * Maps a professor profile entity to the response DTO used in administrative
         * detail views.
         *
         * @param profile professor profile entity
         * @return mapped professor profile response
         */
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
                                .supervisedTheses(
                                                profile.getSupervisedTheses() == null
                                                                ? List.of()
                                                                : profile.getSupervisedTheses().stream()
                                                                                .map(thesis -> SupervisedThesisResponse
                                                                                                .builder()
                                                                                                .id(thesis.getId())
                                                                                                .doctoralStudentName(
                                                                                                                thesis.getDoctoralStudentName())
                                                                                                .thesisTitle(thesis
                                                                                                                .getThesisTitle())
                                                                                                .defenseYear(thesis
                                                                                                                .getDefenseYear())
                                                                                                .researchDescription(
                                                                                                                thesis.getResearchDescription())
                                                                                                .industrialMention(
                                                                                                                thesis.isIndustrialMention())
                                                                                                .internationalMention(
                                                                                                                thesis.isInternationalMention())
                                                                                                .results(thesis.getResults())
                                                                                                .ongoing(thesis.isOngoing())
                                                                                                .build())
                                                                                .toList())
                                .build();
        }

        /**
         * Deletes a non-administrative user together with the dependent data that
         * should not remain orphaned in the system.
         *
         * <p>
         * The deletion process removes, when present, password reset tokens,
         * student or professor profile data, thesis requests linked to the user
         * and finally the user account itself.
         * </p>
         *
         * @param userId identifier of the user to delete
         * @throws ResourceNotFoundException   if the user does not exist
         * @throws ForbiddenOperationException if the user is an administrator
         */
        @Transactional
        public void deleteUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getRole() == UserRole.ADMIN) {
                        throw new ForbiddenOperationException("Admin accounts cannot be deleted from this panel");
                }

                passwordResetTokenRepository.findByUser(user)
                                .ifPresent(passwordResetTokenRepository::delete);

                studentProfileRepository.findByUser(user)
                                .ifPresent(studentProfileRepository::delete);

                professorProfileRepository.findByUser(user)
                                .ifPresent(professorProfileRepository::delete);

                thesisRequestRepository.deleteByStudentOrProfessor(user, user);

                userRepository.delete(user);
        }

        /**
         * Normalizes a free-text value for case-insensitive searching.
         *
         * <p>
         * Blank values are converted to {@code null} so that search filters
         * can be skipped cleanly.
         * </p>
         *
         * @param value raw input value
         * @return normalized lowercase value, or {@code null} if the input is blank
         */
        private String normalize(String value) {
                if (value == null || value.trim().isEmpty()) {
                        return null;
                }
                return value.trim().toLowerCase();
        }

        /**
         * Evaluates whether a source string contains the given query in a
         * case-insensitive way.
         *
         * @param source text where the search is performed
         * @param query  normalized query text
         * @return {@code true} if the source contains the query; {@code false}
         *         otherwise
         */
        private boolean containsIgnoreCase(String source, String query) {
                return source != null && source.toLowerCase().contains(query);
        }
}