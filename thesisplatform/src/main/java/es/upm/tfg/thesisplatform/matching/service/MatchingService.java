package es.upm.tfg.thesisplatform.matching.service;

import es.upm.tfg.thesisplatform.catalog.domain.DoctoralProgram;
import es.upm.tfg.thesisplatform.catalog.domain.ResearchLine;
import es.upm.tfg.thesisplatform.exception.ProfessorProfileNotFoundException;
import es.upm.tfg.thesisplatform.exception.StudentProfileNotFoundException;
import es.upm.tfg.thesisplatform.matching.dto.MatchResultResponse;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final StudentProfileRepository studentProfileRepository;
    private final ProfessorProfileRepository professorProfileRepository;

    public List<MatchResultResponse> matchProfessorsForStudent(String studentEmail) {
        StudentProfile student = studentProfileRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new StudentProfileNotFoundException(studentEmail));

        List<ProfessorProfile> professors = professorProfileRepository.findAll();

        return professors.stream()
                .map(professor -> mapProfessorMatch(student, professor))
                .sorted(Comparator.comparingDouble(MatchResultResponse::getScore).reversed())
                .toList();
    }

    public List<MatchResultResponse> matchStudentsForProfessor(String professorEmail) {
        ProfessorProfile professor = professorProfileRepository.findByUserEmail(professorEmail)
                .orElseThrow(() -> new ProfessorProfileNotFoundException(professorEmail));

        List<StudentProfile> students = studentProfileRepository.findAll();

        return students.stream()
                .map(student -> mapStudentMatch(professor, student))
                .sorted(Comparator.comparingDouble(MatchResultResponse::getScore).reversed())
                .toList();
    }

    private MatchResultResponse mapProfessorMatch(StudentProfile student, ProfessorProfile professor) {
        Set<Long> studentResearchLineIds = student.getResearchLines().stream()
                .map(ResearchLine::getId)
                .collect(Collectors.toSet());

        Set<Long> professorResearchLineIds = professor.getResearchLines().stream()
                .map(ResearchLine::getId)
                .collect(Collectors.toSet());

        Set<Long> studentProgramIds = student.getDoctoralPrograms().stream()
                .map(DoctoralProgram::getId)
                .collect(Collectors.toSet());

        Set<Long> professorProgramIds = professor.getDoctoralPrograms().stream()
                .map(DoctoralProgram::getId)
                .collect(Collectors.toSet());

        long matchingResearchLines = professorResearchLineIds.stream()
                .filter(studentResearchLineIds::contains)
                .count();

        long matchingPrograms = professorProgramIds.stream()
                .filter(studentProgramIds::contains)
                .count();

        double researchLineScore = studentResearchLineIds.isEmpty()
                ? 0
                : ((double) matchingResearchLines / studentResearchLineIds.size()) * 50.0;

        double doctoralProgramScore = studentProgramIds.isEmpty()
                ? 0
                : ((double) matchingPrograms / studentProgramIds.size()) * 30.0;

        double availabilityScore = professor.isAvailableToSupervise() ? 20.0 : 0.0;

        double totalScore = researchLineScore + doctoralProgramScore + availabilityScore;

        return MatchResultResponse.builder()
                .userId(professor.getUser().getId())
                .email(professor.getUser().getEmail())
                .fullName(professor.getFirstName() + " " + professor.getLastName())
                .institution(professor.getInstitution())
                .score(round(totalScore))
                .matchingResearchLines((int) matchingResearchLines)
                .matchingDoctoralPrograms((int) matchingPrograms)
                .researchLines(
                        professor.getResearchLines().stream()
                                .map(ResearchLine::getName)
                                .toList())
                .doctoralPrograms(
                        professor.getDoctoralPrograms().stream()
                                .map(DoctoralProgram::getName)
                                .toList())
                .build();
    }

    private MatchResultResponse mapStudentMatch(ProfessorProfile professor, StudentProfile student) {
        Set<Long> professorResearchLineIds = professor.getResearchLines().stream()
                .map(ResearchLine::getId)
                .collect(Collectors.toSet());

        Set<Long> studentResearchLineIds = student.getResearchLines().stream()
                .map(ResearchLine::getId)
                .collect(Collectors.toSet());

        Set<Long> professorProgramIds = professor.getDoctoralPrograms().stream()
                .map(DoctoralProgram::getId)
                .collect(Collectors.toSet());

        Set<Long> studentProgramIds = student.getDoctoralPrograms().stream()
                .map(DoctoralProgram::getId)
                .collect(Collectors.toSet());

        long matchingResearchLines = studentResearchLineIds.stream()
                .filter(professorResearchLineIds::contains)
                .count();

        long matchingPrograms = studentProgramIds.stream()
                .filter(professorProgramIds::contains)
                .count();

        double researchLineScore = professorResearchLineIds.isEmpty()
                ? 0
                : ((double) matchingResearchLines / professorResearchLineIds.size()) * 50.0;

        double doctoralProgramScore = professorProgramIds.isEmpty()
                ? 0
                : ((double) matchingPrograms / professorProgramIds.size()) * 30.0;

        double availabilityScore = professor.isAvailableToSupervise() ? 20.0 : 0.0;

        double totalScore = researchLineScore + doctoralProgramScore + availabilityScore;

        return MatchResultResponse.builder()
                .userId(student.getUser().getId())
                .email(student.getUser().getEmail())
                .fullName(student.getFirstName() + " " + student.getLastName())
                .institution(student.getOriginInstitution())
                .score(round(totalScore))
                .matchingResearchLines((int) matchingResearchLines)
                .matchingDoctoralPrograms((int) matchingPrograms)
                .researchLines(
                        student.getResearchLines().stream()
                                .map(ResearchLine::getName)
                                .toList())
                .doctoralPrograms(
                        student.getDoctoralPrograms().stream()
                                .map(DoctoralProgram::getName)
                                .toList())
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}