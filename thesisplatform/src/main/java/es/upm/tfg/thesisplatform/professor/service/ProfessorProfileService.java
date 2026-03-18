package es.upm.tfg.thesisplatform.professor.service;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.catalog.repository.DoctoralProgramRepository;
import es.upm.tfg.thesisplatform.catalog.repository.ResearchLineRepository;
import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.ProfessorProfileNotFoundException;
import es.upm.tfg.thesisplatform.exception.ResourceNotFoundException;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileRequest;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorProfileResponse;
import es.upm.tfg.thesisplatform.professor.dto.ProfessorSearchRequest;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfessorProfileService {

        private final ProfessorProfileRepository professorProfileRepository;
        private final UserRepository userRepository;
        private final DoctoralProgramRepository doctoralProgramRepository;
        private final ResearchLineRepository researchLineRepository;

        public ProfessorProfileResponse getMyProfile(String email) {
                ProfessorProfile profile = professorProfileRepository.findByUserEmail(email)
                                .orElseThrow(() -> new ProfessorProfileNotFoundException(email));

                return mapToResponse(profile);
        }

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

                List<Long> researchLineIds = request.getResearchLineIds();
                Set<ResearchLine> researchLines = new HashSet<>(
                                researchLineRepository.findAllById(researchLineIds));

                Set<Long> foundResearchLineIds = researchLines.stream()
                                .map(ResearchLine::getId)
                                .collect(Collectors.toSet());

                Set<Long> missingResearchLineIds = new HashSet<>(researchLineIds);
                missingResearchLineIds.removeAll(foundResearchLineIds);

                if (!missingResearchLineIds.isEmpty()) {
                        throw new ResourceNotFoundException(
                                        "Research lines not found: " + missingResearchLineIds);
                }

                profile.setDoctoralPrograms(programs);
                profile.setResearchLines(researchLines);

                ProfessorProfile savedProfile = professorProfileRepository.save(profile);

                return mapToResponse(savedProfile);
        }

        private ProfessorProfileResponse mapToResponse(ProfessorProfile profile) {
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
                                                                .map(DoctoralProgram::getName)
                                                                .toList())
                                .researchLines(
                                                profile.getResearchLines().stream()
                                                                .map(ResearchLine::getName)
                                                                .toList())
                                .build();
        }

        public List<ProfessorProfileResponse> search(ProfessorSearchRequest request) {
                List<Long> programIds = normalizeList(request.getDoctoralProgramIds());
                List<Long> lineIds = normalizeList(request.getResearchLineIds());
                String institution = normalizeText(request.getInstitution());

                return professorProfileRepository.search(
                                programIds,
                                lineIds,
                                request.getAvailableToSupervise(),
                                institution).stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        private List<Long> normalizeList(List<Long> values) {
                return (values == null || values.isEmpty()) ? null : values;
        }

        private String normalizeText(String value) {
                if (value == null || value.trim().isEmpty()) {
                        return null;
                }
                return value.trim();
        }
}