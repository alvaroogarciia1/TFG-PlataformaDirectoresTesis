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
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

        private final StudentProfileRepository studentProfileRepository;
        private final ProfessorProfileRepository professorProfileRepository;

        @Transactional(readOnly = true)
        public List<MatchResultResponse> matchProfessorsForStudent(String studentEmail) {
                StudentProfile student = studentProfileRepository.findByUserEmail(studentEmail)
                                .orElseThrow(() -> new StudentProfileNotFoundException(studentEmail));

                return professorProfileRepository.findAll().stream()
                                .map(professor -> mapProfessorMatch(student, professor))
                                .filter(match -> match.getTotalScore() > 0)
                                .sorted(Comparator
                                                .comparingDouble(MatchResultResponse::getTotalScore).reversed()
                                                .thenComparing(MatchResultResponse::getFullName))
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<MatchResultResponse> matchStudentsForProfessor(String professorEmail) {
                ProfessorProfile professor = professorProfileRepository.findByUserEmail(professorEmail)
                                .orElseThrow(() -> new ProfessorProfileNotFoundException(professorEmail));

                return studentProfileRepository.findAll().stream()
                                .map(student -> mapStudentMatch(professor, student))
                                .filter(match -> match.getTotalScore() > 0)
                                .sorted(Comparator
                                                .comparingDouble(MatchResultResponse::getTotalScore).reversed()
                                                .thenComparing(MatchResultResponse::getFullName))
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
                                .totalScore(round(totalScore))
                                .researchLineScore(round(researchLineScore))
                                .doctoralProgramScore(round(doctoralProgramScore))
                                .availabilityScore(round(availabilityScore))
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
                                .matchExplanation(buildProfessorExplanation(
                                                matchingResearchLines,
                                                matchingPrograms,
                                                professor.isAvailableToSupervise()))
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
                                .totalScore(round(totalScore))
                                .researchLineScore(round(researchLineScore))
                                .doctoralProgramScore(round(doctoralProgramScore))
                                .availabilityScore(round(availabilityScore))
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
                                .matchExplanation(buildStudentExplanation(
                                                matchingResearchLines,
                                                matchingPrograms,
                                                professor.isAvailableToSupervise()))
                                .build();
        }

        private String buildProfessorExplanation(long matchingResearchLines, long matchingPrograms, boolean available) {
                StringBuilder explanation = new StringBuilder("Match based on ");

                explanation.append(matchingResearchLines)
                                .append(" shared research line");
                if (matchingResearchLines != 1) {
                        explanation.append("s");
                }

                explanation.append(" and ")
                                .append(matchingPrograms)
                                .append(" shared doctoral program");
                if (matchingPrograms != 1) {
                        explanation.append("s");
                }

                explanation.append(". ");

                if (available) {
                        explanation.append("Professor is currently available to supervise.");
                } else {
                        explanation.append("Professor is currently marked as not available to supervise.");
                }

                return explanation.toString();
        }

        private String buildStudentExplanation(long matchingResearchLines, long matchingPrograms,
                        boolean availableProfessor) {
                StringBuilder explanation = new StringBuilder("Match based on ");

                explanation.append(matchingResearchLines)
                                .append(" shared research line");
                if (matchingResearchLines != 1) {
                        explanation.append("s");
                }

                explanation.append(" and ")
                                .append(matchingPrograms)
                                .append(" shared doctoral program");
                if (matchingPrograms != 1) {
                        explanation.append("s");
                }

                explanation.append(". ");

                if (availableProfessor) {
                        explanation.append("Professor is currently available to supervise.");
                } else {
                        explanation.append("Professor is currently marked as not available to supervise.");
                }

                return explanation.toString();
        }

        private double round(double value) {
                return Math.round(value * 100.0) / 100.0;
        }
}