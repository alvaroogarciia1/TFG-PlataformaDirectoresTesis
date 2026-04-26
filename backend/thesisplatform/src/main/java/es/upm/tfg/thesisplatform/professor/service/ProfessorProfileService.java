package es.upm.tfg.thesisplatform.professor.service;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import es.upm.tfg.thesisplatform.catalog.repository.ResearchLineRepository;
import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.InvalidFileException;
import es.upm.tfg.thesisplatform.exception.ProfessorProfileNotFoundException;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileRequest;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorSearchRequest;
import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisResponse;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.storage.FileStorageService;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service responsible for professor profile management.
 *
 * <p>
 * This service encapsulates the business logic related to:
 * <ul>
 * <li>Retrieval and update of professor profiles</li>
 * <li>Manual search over professor profiles</li>
 * <li>CV upload and retrieval</li>
 * <li>Initial profile creation with CV</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ProfessorProfileService {

        /**
         * Repository used to access professor profiles.
         */
        private final ProfessorProfileRepository professorProfileRepository;

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
         * Retrieves the fully detailed profile of the authenticated professor.
         *
         * @param email email of the authenticated professor
         * @return professor profile response
         * @throws ProfessorProfileNotFoundException if the profile does not exist
         */
        @Transactional(readOnly = true)
        public ProfessorProfileResponse getMyProfile(String email) {
                ProfessorProfile profile = professorProfileRepository.findDetailedByUserEmail(email)
                                .orElseThrow(() -> new ProfessorProfileNotFoundException(email));

                return mapToResponse(profile);
        }

        /**
         * Creates or updates the professor profile associated with the given email.
         *
         * @param email   authenticated professor email
         * @param request request DTO with profile data
         * @return saved professor profile response
         * @throws ProfessorProfileNotFoundException if the user does not exist
         * @throws ForbiddenOperationException       if the user does not have professor
         *                                           role
         * @throws ResourceNotFoundException         if one or more doctoral program ids
         *                                           do not exist
         */
        public ProfessorProfileResponse upsertMyProfile(String email, ProfessorProfileRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ProfessorProfileNotFoundException(email));

                if (user.getRole() != UserRole.PROFESSOR) {
                        throw new ForbiddenOperationException(
                                        "Only users with PROFESSOR role can manage a professor profile");
                }

                ProfessorProfile profile = professorProfileRepository.findByUserEmail(email)
                                .orElse(
                                                ProfessorProfile.builder()
                                                                .user(user)
                                                                .build());

                profile.setFirstName(request.getFirstName().trim());
                profile.setLastName(request.getLastName().trim());
                profile.setInstitution(request.getInstitution().trim());
                profile.setDepartment(request.getDepartment());
                profile.setAvailableToSupervise(request.getAvailableToSupervise());
                profile.setMaxPhdStudents(request.getMaxPhdStudents());
                profile.setAdditionalInformation(request.getAdditionalInformation());
                profile.setCvUrl(request.getCvUrl().trim());

                List<Long> doctoralProgramIds = request.getDoctoralProgramIds();
                Set<DoctoralProgram> programs = new HashSet<>(
                                doctoralProgramRepository.findAllById(doctoralProgramIds));

                Set<Long> foundDoctoralProgramIds = programs.stream()
                                .map(DoctoralProgram::getId)
                                .collect(Collectors.toSet());

                Set<Long> missingDoctoralProgramIds = new HashSet<>(doctoralProgramIds);
                missingDoctoralProgramIds.removeAll(foundDoctoralProgramIds);

                if (!missingDoctoralProgramIds.isEmpty()) {
                        throw new ResourceNotFoundException(
                                        "Doctoral programs not found: " + missingDoctoralProgramIds);
                }

                Set<ResearchLine> researchLines = request.getResearchLines().stream()
                                .map(name -> researchLineRepository.findByNameIgnoreCase(name.trim())
                                                .orElseGet(() -> researchLineRepository.save(
                                                                ResearchLine.builder().name(name.trim()).build())))
                                .collect(java.util.stream.Collectors.toSet());

                profile.setDoctoralPrograms(programs);
                profile.setResearchLines(researchLines);

                ProfessorProfile savedProfile = professorProfileRepository.save(profile);

                return mapToResponse(savedProfile);
        }

        /**
         * Maps a professor profile entity to its response DTO.
         *
         * @param profile professor profile entity
         * @return mapped professor profile response
         */
        private ProfessorProfileResponse mapToResponse(ProfessorProfile profile) {
                return ProfessorProfileResponse.builder()
                                .id(profile.getId())
                                .userId(profile.getUser().getId())
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
                                                                .map(DoctoralProgram::getName)
                                                                .toList())
                                .researchLines(
                                                profile.getResearchLines().stream()
                                                                .map(ResearchLine::getName)
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
                                                                                                .thesisTitle(
                                                                                                                thesis.getThesisTitle())
                                                                                                .defenseYear(
                                                                                                                thesis.getDefenseYear())
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
         * Searches professor profiles using structured optional filters.
         *
         * @param request search request containing filter values
         * @return list of professor profiles matching the filters
         */
        @Transactional(readOnly = true)
        public List<ProfessorProfileResponse> search(ProfessorSearchRequest request) {
                List<Long> programIds = normalizeList(request.getDoctoralProgramIds());
                List<Long> lineIds = normalizeList(request.getResearchLineIds());
                String institution = normalizeText(request.getInstitution());

                return professorProfileRepository.search(
                                programIds,
                                lineIds,
                                request.getAvailableToSupervise(),
                                institution)
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
         * Uploads or replaces the CV of the authenticated professor.
         *
         * @param email authenticated professor email
         * @param file  uploaded CV file
         * @return updated professor profile response
         * @throws ResourceNotFoundException if the profile does not exist
         */
        public ProfessorProfileResponse uploadCv(String email, MultipartFile file) {

                ProfessorProfile profile = professorProfileRepository.findByUserEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

                String fileUrl = fileStorageService.saveFile(file, "professors");

                profile.setCvUrl(fileUrl);

                ProfessorProfile saved = professorProfileRepository.save(profile);

                return mapToResponse(saved);
        }

        /**
         * Searches professor profiles by name.
         *
         * @param name optional name fragment
         * @return list of professor profiles whose full name matches the query
         */
        @Transactional(readOnly = true)
        public List<ProfessorProfileResponse> searchByName(String name) {
                return professorProfileRepository.searchByName(name)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        /**
         * Loads the CV file resource of the authenticated professor.
         *
         * @param email authenticated professor email
         * @return CV file as a resource
         * @throws ProfessorProfileNotFoundException if the profile does not exist
         */
        public Resource getMyCvFile(String email) {
                ProfessorProfile profile = professorProfileRepository.findDetailedByUserEmail(email)
                                .orElseThrow(() -> new ProfessorProfileNotFoundException(email));

                try {
                        Path path = Paths.get(profile.getCvUrl());
                        return new UrlResource(path.toUri());
                } catch (Exception e) {
                        throw new RuntimeException("Error loading CV");
                }
        }

        /**
         * Creates the initial professor profile together with the uploaded CV.
         *
         * @param email   authenticated professor email
         * @param request request DTO with profile data
         * @param file    uploaded CV file
         * @return created professor profile response
         * @throws ResourceNotFoundException   if the user does not exist
         * @throws ForbiddenOperationException if the profile already exists
         * @throws InvalidFileException        if no CV file is provided
         */
        @Transactional
        public ProfessorProfileResponse createProfileWithCv(
                        String email,
                        ProfessorProfileRequest request,
                        MultipartFile file) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (professorProfileRepository.findByUserId(user.getId()).isPresent()) {
                        throw new ForbiddenOperationException("Professor profile already exists");
                }

                if (file == null || file.isEmpty()) {
                        throw new InvalidFileException("CV file is required");
                }

                String cvUrl = fileStorageService.saveFile(file, "professors");

                List<DoctoralProgram> doctoralPrograms = doctoralProgramRepository
                                .findAllById(request.getDoctoralProgramIds());

                Set<ResearchLine> researchLines = request.getResearchLines().stream()
                                .map(name -> researchLineRepository.findByNameIgnoreCase(name.trim())
                                                .orElseGet(() -> researchLineRepository.save(
                                                                ResearchLine.builder().name(name.trim()).build())))
                                .collect(java.util.stream.Collectors.toSet());

                ProfessorProfile profile = ProfessorProfile.builder()
                                .user(user)
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .institution(request.getInstitution())
                                .department(request.getDepartment())
                                .availableToSupervise(request.getAvailableToSupervise())
                                .maxPhdStudents(request.getMaxPhdStudents())
                                .additionalInformation(request.getAdditionalInformation())
                                .cvUrl(cvUrl)
                                .doctoralPrograms(new HashSet<>(doctoralPrograms))
                                .researchLines(researchLines)
                                .build();

                ProfessorProfile saved = professorProfileRepository.save(profile);

                return mapToResponse(saved);
        }
}