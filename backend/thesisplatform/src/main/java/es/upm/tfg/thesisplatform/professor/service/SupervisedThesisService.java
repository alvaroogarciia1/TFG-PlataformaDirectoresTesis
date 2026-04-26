package es.upm.tfg.thesisplatform.professor.service;

import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.ProfessorProfileNotFoundException;
import es.upm.tfg.thesisplatform.exception.SupervisedThesisNotFoundException;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.domain.SupervisedThesis;
import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisRequest;
import es.upm.tfg.thesisplatform.professor.dto.SupervisedThesisResponse;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.professor.repository.SupervisedThesisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsible for supervised thesis management.
 *
 * <p>
 * This service encapsulates the logic for creating, retrieving and deleting
 * supervised thesis records linked to a professor profile.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class SupervisedThesisService {

    /**
     * Repository used to access supervised thesis records.
     */
    private final SupervisedThesisRepository supervisedThesisRepository;

    /**
     * Repository used to access professor profiles.
     */
    private final ProfessorProfileRepository professorProfileRepository;

    /**
     * Creates a new supervised thesis record for the given professor.
     *
     * @param professorEmail email of the authenticated professor
     * @param request        request DTO containing thesis data
     * @return created supervised thesis response
     * @throws ProfessorProfileNotFoundException if the professor profile does not
     *                                           exist
     */
    public SupervisedThesisResponse create(String professorEmail, SupervisedThesisRequest request) {
        ProfessorProfile professorProfile = professorProfileRepository.findByUserEmail(professorEmail)
                .orElseThrow(() -> new ProfessorProfileNotFoundException(professorEmail));

        SupervisedThesis thesis = SupervisedThesis.builder()
                .professorProfile(professorProfile)
                .doctoralStudentName(request.getDoctoralStudentName().trim())
                .thesisTitle(request.getThesisTitle().trim())
                .defenseYear(request.getDefenseYear())
                .researchDescription(request.getResearchDescription())
                .industrialMention(Boolean.TRUE.equals(request.getIndustrialMention()))
                .internationalMention(Boolean.TRUE.equals(request.getInternationalMention()))
                .results(request.getResults())
                .ongoing(Boolean.TRUE.equals(request.getOngoing()))
                .build();

        SupervisedThesis saved = supervisedThesisRepository.save(thesis);
        return mapToResponse(saved);
    }

    /**
     * Retrieves all supervised theses belonging to the authenticated professor.
     *
     * @param professorEmail email of the authenticated professor
     * @return list of supervised thesis responses
     */
    public List<SupervisedThesisResponse> getMyTheses(String professorEmail) {
        return supervisedThesisRepository.findByProfessorProfileUserEmailOrderByCreatedAtDesc(professorEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Deletes a supervised thesis record if it belongs to the authenticated
     * professor.
     *
     * @param professorEmail email of the authenticated professor
     * @param thesisId       identifier of the thesis to delete
     * @throws SupervisedThesisNotFoundException if the thesis does not exist
     * @throws ForbiddenOperationException       if the thesis does not belong to
     *                                           the professor
     */
    public void delete(String professorEmail, Long thesisId) {
        SupervisedThesis thesis = supervisedThesisRepository.findById(thesisId)
                .orElseThrow(() -> new SupervisedThesisNotFoundException(thesisId));

        if (!thesis.getProfessorProfile().getUser().getEmail().equals(professorEmail)) {
            throw new ForbiddenOperationException("You cannot delete a supervised thesis that is not yours");
        }

        supervisedThesisRepository.delete(thesis);
    }

    /**
     * Updates a supervised thesis record if it belongs to the authenticated
     * professor.
     *
     * @param professorEmail email of the authenticated professor
     * @param thesisId       identifier of the thesis to update
     * @param request        request DTO containing the updated thesis data
     * @return updated supervised thesis response
     * @throws SupervisedThesisNotFoundException if the thesis does not exist
     * @throws ForbiddenOperationException       if the thesis does not belong to
     *                                           the professor
     */
    public SupervisedThesisResponse update(String professorEmail, Long thesisId, SupervisedThesisRequest request) {
        SupervisedThesis thesis = supervisedThesisRepository.findById(thesisId)
                .orElseThrow(() -> new SupervisedThesisNotFoundException(thesisId));

        if (!thesis.getProfessorProfile().getUser().getEmail().equals(professorEmail)) {
            throw new ForbiddenOperationException("You cannot update a supervised thesis that is not yours");
        }

        thesis.setDoctoralStudentName(request.getDoctoralStudentName().trim());
        thesis.setThesisTitle(request.getThesisTitle().trim());
        thesis.setDefenseYear(request.getDefenseYear());
        thesis.setResearchDescription(request.getResearchDescription());
        thesis.setIndustrialMention(Boolean.TRUE.equals(request.getIndustrialMention()));
        thesis.setInternationalMention(Boolean.TRUE.equals(request.getInternationalMention()));
        thesis.setResults(request.getResults());
        thesis.setOngoing(Boolean.TRUE.equals(request.getOngoing()));

        SupervisedThesis saved = supervisedThesisRepository.save(thesis);
        return mapToResponse(saved);
    }

    /**
     * Maps a supervised thesis entity to its response DTO.
     *
     * @param thesis supervised thesis entity
     * @return mapped supervised thesis response
     */
    private SupervisedThesisResponse mapToResponse(SupervisedThesis thesis) {
        return SupervisedThesisResponse.builder()
                .id(thesis.getId())
                .doctoralStudentName(thesis.getDoctoralStudentName())
                .thesisTitle(thesis.getThesisTitle())
                .defenseYear(thesis.getDefenseYear())
                .researchDescription(thesis.getResearchDescription())
                .industrialMention(thesis.isIndustrialMention())
                .internationalMention(thesis.isInternationalMention())
                .results(thesis.getResults())
                .ongoing(thesis.isOngoing())
                .build();
    }
}