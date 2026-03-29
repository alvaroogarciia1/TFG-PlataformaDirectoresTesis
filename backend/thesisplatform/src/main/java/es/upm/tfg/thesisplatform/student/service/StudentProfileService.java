package es.upm.tfg.thesisplatform.student.service;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import es.upm.tfg.thesisplatform.catalog.repository.ResearchLineRepository;
import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.InvalidFileException;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import es.upm.tfg.thesisplatform.exception.StudentProfileNotFoundException;
import es.upm.tfg.thesisplatform.storage.FileStorageService;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileRequest;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.dto.StudentSearchRequest;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service responsible for student profile management.
 *
 * <p>This service encapsulates the business logic related to:
 * <ul>
 *     <li>Retrieval and update of student profiles</li>
 *     <li>Manual search over student profiles</li>
 *     <li>CV upload and retrieval</li>
 *     <li>Initial profile creation with CV</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class StudentProfileService {

        /**
         * Repository used to access student profiles.
         */
        private final StudentProfileRepository studentProfileRepository;

        /**
         * Repository used to access users.
         */
        private final UserRepository userRepository;

        /**
         * Repository used to access doctoral programs.
         */
        private final DoctoralProgramRepository doctoralProgramRepository;

        /**
         * Repository used to access research lines.
         */
        private final ResearchLineRepository researchLineRepository;

        /**
         * Service used to store uploaded files such as CVs.
         */
        private final FileStorageService fileStorageService;

        /**
         * Retrieves the fully detailed profile of the authenticated student.
         *
         * @param email email of the authenticated student
         * @return student profile response
         * @throws StudentProfileNotFoundException if the profile does not exist
         */
        @Transactional(readOnly = true)
        public StudentProfileResponse getMyProfile(String email) {
                StudentProfile profile = studentProfileRepository.findDetailedByUserEmail(email)
                                .orElseThrow(() -> new StudentProfileNotFoundException(email));

                return mapToResponse(profile);
        }

        /**
         * Creates or updates the student profile associated with the given email.
         *
         * @param email authenticated student email
         * @param request request DTO with profile data
         * @return saved student profile response
         * @throws StudentProfileNotFoundException if the user does not exist
         * @throws ForbiddenOperationException if the user does not have student role
         * @throws ResourceNotFoundException if one or more doctoral program ids do not exist
         */
        public StudentProfileResponse upsertMyProfile(String email, StudentProfileRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new StudentProfileNotFoundException(email));

                if (user.getRole() != UserRole.STUDENT) {
                        throw new ForbiddenOperationException(
                                        "Only users with STUDENT role can manage a student profile");
                }

                StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                                .orElse(
                                                StudentProfile.builder()
                                                                .user(user)
                                                                .build());

                profile.setFirstName(request.getFirstName().trim());
                profile.setLastName(request.getLastName().trim());
                profile.setOriginInstitution(request.getOriginInstitution().trim());
                profile.setMotivation(request.getMotivation().trim());
                profile.setProposedThesisTitle(request.getProposedThesisTitle().trim());
                profile.setHasFunding(request.getHasFunding());
                profile.setFundingType(request.getFundingType());
                profile.setFundingDurationMonths(request.getFundingDurationMonths());
                profile.setWillingToRelocateToMadrid(request.getWillingToRelocateToMadrid());
                profile.setDedicationType(request.getDedicationType());
                profile.setAdditionalInformation(request.getAdditionalInformation());
                profile.setCvUrl(request.getCvUrl().trim());

                List<Long> doctoralProgramIds = request.getDoctoralProgramIds();
                Set<DoctoralProgram> programs = new HashSet<>(
                                doctoralProgramRepository.findAllById(doctoralProgramIds));

                Set<Long> foundDoctoralProgramIds = programs.stream()
                                .map(DoctoralProgram::getId)
                                .collect(java.util.stream.Collectors.toSet());

                Set<Long> missingDoctoralProgramIds = new HashSet<>(doctoralProgramIds);
                missingDoctoralProgramIds.removeAll(foundDoctoralProgramIds);

                if (!missingDoctoralProgramIds.isEmpty()) {
                        throw new ResourceNotFoundException(
                                        "Doctoral programs not found: " + missingDoctoralProgramIds);
                }

                Set<ResearchLine> researchLines = request.getResearchLines().stream()
                                .map(name -> {
                                        return researchLineRepository.findByNameIgnoreCase(name.trim())
                                                        .orElseGet(() -> researchLineRepository.save(
                                                                        ResearchLine.builder().name(name.trim())
                                                                                        .build()));
                                })
                                .collect(java.util.stream.Collectors.toSet());

                profile.setDoctoralPrograms(programs);
                profile.setResearchLines(researchLines);

                StudentProfile savedProfile = studentProfileRepository.save(profile);

                return mapToResponse(savedProfile);
        }

        /**
         * Maps a student profile entity to its response DTO.
         *
         * @param profile student profile entity
         * @return mapped student profile response
         */
        private StudentProfileResponse mapToResponse(StudentProfile profile) {
                return StudentProfileResponse.builder()
                                .id(profile.getId())
                                .userId(profile.getUser().getId())
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
                                                                .map(DoctoralProgram::getName)
                                                                .toList())
                                .researchLines(
                                                profile.getResearchLines().stream()
                                                                .map(ResearchLine::getName)
                                                                .toList())
                                .build();
        }

        /**
         * Searches student profiles using structured optional filters.
         *
         * @param request search request containing filter values
         * @return list of student profiles matching the filters
         */
        @Transactional(readOnly = true)
        public List<StudentProfileResponse> search(StudentSearchRequest request) {
                List<Long> programIds = normalizeList(request.getDoctoralProgramIds());
                List<Long> lineIds = normalizeList(request.getResearchLineIds());
                String originInstitution = normalizeText(request.getOriginInstitution());

                return studentProfileRepository.search(
                                programIds,
                                lineIds,
                                request.getHasFunding(),
                                request.getWillingToRelocateToMadrid(),
                                request.getDedicationType(),
                                originInstitution)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        /**
         * Normalizes a list-based filter by converting null or empty lists to null.
         *
         * @param values raw list of filter values
         * @return normalized list or null
         */
        private List<Long> normalizeList(List<Long> values) {
                return (values == null || values.isEmpty()) ? null : values;
        }

        /**
         * Normalizes a text filter by trimming it and converting blank values to null.
         *
         * @param value raw text value
         * @return normalized text or null
         */
        private String normalizeText(String value) {
                if (value == null || value.trim().isEmpty()) {
                        return null;
                }
                return value.trim();
        }

        /**
         * Uploads or replaces the CV of the authenticated student.
         *
         * @param email authenticated student email
         * @param file uploaded CV file
         * @return updated student profile response
         * @throws ResourceNotFoundException if the profile does not exist
         */
        public StudentProfileResponse uploadCv(String email, MultipartFile file) {

                StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

                String fileUrl = fileStorageService.saveFile(file, "students");

                profile.setCvUrl(fileUrl);

                StudentProfile saved = studentProfileRepository.save(profile);

                return mapToResponse(saved);
        }

        /**
         * Searches student profiles by proposed thesis title.
         *
         * @param title optional thesis title fragment
         * @return list of student profiles whose thesis title matches the query
         */
        @Transactional(readOnly = true)
        public List<StudentProfileResponse> searchByThesisTitle(String title) {
                return studentProfileRepository.searchByThesisTitle(title)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        /**
         * Loads the CV file resource of the authenticated student.
         *
         * @param email authenticated student email
         * @return CV file as a resource
         * @throws StudentProfileNotFoundException if the profile does not exist
         */
        public Resource getMyCvFile(String email) {
                StudentProfile profile = studentProfileRepository.findDetailedByUserEmail(email)
                                .orElseThrow(() -> new StudentProfileNotFoundException(email));

                try {
                        Path path = Paths.get(profile.getCvUrl());
                        return new UrlResource(path.toUri());
                } catch (Exception e) {
                        throw new RuntimeException("Error loading CV");
                }
        }

        /**
         * Creates the initial student profile together with the uploaded CV.
         *
         * @param email authenticated student email
         * @param request request DTO with profile data
         * @param file uploaded CV file
         * @return created student profile response
         * @throws ResourceNotFoundException if the user does not exist
         * @throws ForbiddenOperationException if the profile already exists
         * @throws InvalidFileException if no CV file is provided
         */
        @Transactional
        public StudentProfileResponse createProfileWithCv(
                        String email,
                        StudentProfileRequest request,
                        MultipartFile file) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (studentProfileRepository.findByUserId(user.getId()).isPresent()) {
                        throw new ForbiddenOperationException("Student profile already exists");
                }

                if (file == null || file.isEmpty()) {
                        throw new InvalidFileException("CV file is required");
                }

                String cvUrl = fileStorageService.saveFile(file, "students");

                List<DoctoralProgram> doctoralPrograms = doctoralProgramRepository
                                .findAllById(request.getDoctoralProgramIds());

                Set<ResearchLine> researchLines = request.getResearchLines().stream()
                                .map(name -> {
                                        return researchLineRepository.findByNameIgnoreCase(name.trim())
                                                        .orElseGet(() -> researchLineRepository.save(
                                                                        ResearchLine.builder().name(name.trim())
                                                                                        .build()));
                                })
                                .collect(java.util.stream.Collectors.toSet());

                StudentProfile profile = StudentProfile.builder()
                                .user(user)
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .originInstitution(request.getOriginInstitution())
                                .motivation(request.getMotivation())
                                .proposedThesisTitle(request.getProposedThesisTitle())
                                .hasFunding(request.getHasFunding())
                                .fundingType(request.getFundingType())
                                .fundingDurationMonths(request.getFundingDurationMonths())
                                .willingToRelocateToMadrid(request.getWillingToRelocateToMadrid())
                                .dedicationType(request.getDedicationType())
                                .additionalInformation(request.getAdditionalInformation())
                                .cvUrl(cvUrl)
                                .doctoralPrograms(new HashSet<>(doctoralPrograms))
                                .researchLines(researchLines)
                                .build();

                StudentProfile saved = studentProfileRepository.save(profile);

                return mapToResponse(saved);
        }
}