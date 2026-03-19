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

@Service
@RequiredArgsConstructor
public class SupervisedThesisService {

    private final SupervisedThesisRepository supervisedThesisRepository;
    private final ProfessorProfileRepository professorProfileRepository;

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

    public List<SupervisedThesisResponse> getMyTheses(String professorEmail) {
        return supervisedThesisRepository.findByProfessorProfileUserEmailOrderByCreatedAtDesc(professorEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void delete(String professorEmail, Long thesisId) {
        SupervisedThesis thesis = supervisedThesisRepository.findById(thesisId)
                .orElseThrow(() -> new SupervisedThesisNotFoundException(thesisId));

        if (!thesis.getProfessorProfile().getUser().getEmail().equals(professorEmail)) {
            throw new ForbiddenOperationException("You cannot delete a supervised thesis that is not yours");
        }

        supervisedThesisRepository.delete(thesis);
    }

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