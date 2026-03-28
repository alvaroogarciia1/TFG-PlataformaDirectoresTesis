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

/**
 * Service responsible for computing automatic affinity matches between
 * students and professors.
 *
 * <p>
 * The matching algorithm compares structured academic information from both
 * profiles and generates a quantitative score based on three criteria:
 * </p>
 * <ul>
 * <li>Research line coincidence (50%)</li>
 * <li>Doctoral program coincidence (30%)</li>
 * <li>Professor availability (20%)</li>
 * </ul>
 *
 * <p>
 * The service returns only results with a positive total score and sorts them
 * in descending order by affinity.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class MatchingService {

        /**
         * Repository used to access student profiles.
         */
        private final StudentProfileRepository studentProfileRepository;

        /**
         * Repository used to access professor profiles.
         */
        private final ProfessorProfileRepository professorProfileRepository;

        /**
         * Computes the list of professors that best match the given student.
         *
         * @param studentEmail email of the authenticated student
         * @return ordered list of matching professor results with positive affinity
         * @throws StudentProfileNotFoundException if the student profile does not exist
         */
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

        /**
         * Computes the list of students that best match the given professor.
         *
         * @param professorEmail email of the authenticated professor
         * @return ordered list of matching student results with positive affinity
         * @throws ProfessorProfileNotFoundException if the professor profile does not
         *                                           exist
         */
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

        /**
         * Builds the matching result from the perspective of a student searching
         * for potential professors.
         *
         * @param student   student profile used as the source of the comparison
         * @param professor professor profile evaluated as a potential match
         * @return detailed match result for the professor
         */
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

                int maxResearchLines = Math.max(studentResearchLineIds.size(), professorResearchLineIds.size());
                double researchLineScore = maxResearchLines == 0
                                ? 0
                                : ((double) matchingResearchLines / maxResearchLines) * 50.0;

                int maxPrograms = Math.max(studentProgramIds.size(), professorProgramIds.size());
                double doctoralProgramScore = maxPrograms == 0
                                ? 0
                                : ((double) matchingPrograms / maxPrograms) * 30.0;

                double availabilityScore = professor.isAvailableToSupervise() ? 20.0 : 0.0;
                double totalScore = researchLineScore + doctoralProgramScore + availabilityScore;

                List<String> sharedResearchLines = professor.getResearchLines().stream()
                                .filter(line -> studentResearchLineIds.contains(line.getId()))
                                .map(ResearchLine::getName)
                                .toList();

                List<String> sharedDoctoralPrograms = professor.getDoctoralPrograms().stream()
                                .filter(program -> studentProgramIds.contains(program.getId()))
                                .map(DoctoralProgram::getName)
                                .toList();

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
                                .matchExplanation(buildDetailedExplanation(
                                                totalScore,
                                                researchLineScore,
                                                doctoralProgramScore,
                                                availabilityScore,
                                                (int) matchingResearchLines,
                                                maxResearchLines,
                                                (int) matchingPrograms,
                                                maxPrograms,
                                                sharedResearchLines,
                                                sharedDoctoralPrograms,
                                                professor.isAvailableToSupervise()))
                                .build();
        }

        /**
         * Builds the matching result from the perspective of a professor searching
         * for potential students.
         *
         * @param professor professor profile used as the source of the comparison
         * @param student   student profile evaluated as a potential match
         * @return detailed match result for the student
         */
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

                int maxResearchLines = Math.max(studentResearchLineIds.size(), professorResearchLineIds.size());
                double researchLineScore = maxResearchLines == 0
                                ? 0
                                : ((double) matchingResearchLines / maxResearchLines) * 50.0;

                int maxPrograms = Math.max(studentProgramIds.size(), professorProgramIds.size());
                double doctoralProgramScore = maxPrograms == 0
                                ? 0
                                : ((double) matchingPrograms / maxPrograms) * 30.0;

                double availabilityScore = professor.isAvailableToSupervise() ? 20.0 : 0.0;
                double totalScore = researchLineScore + doctoralProgramScore + availabilityScore;

                List<String> sharedResearchLines = student.getResearchLines().stream()
                                .filter(line -> professorResearchLineIds.contains(line.getId()))
                                .map(ResearchLine::getName)
                                .toList();

                List<String> sharedDoctoralPrograms = student.getDoctoralPrograms().stream()
                                .filter(program -> professorProgramIds.contains(program.getId()))
                                .map(DoctoralProgram::getName)
                                .toList();

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
                                .matchExplanation(buildDetailedExplanation(
                                                totalScore,
                                                researchLineScore,
                                                doctoralProgramScore,
                                                availabilityScore,
                                                (int) matchingResearchLines,
                                                maxResearchLines,
                                                (int) matchingPrograms,
                                                maxPrograms,
                                                sharedResearchLines,
                                                sharedDoctoralPrograms,
                                                professor.isAvailableToSupervise()))
                                .build();
        }

        /**
         * Builds a human-readable explanation of the matching result, including
         * the contribution of each scoring criterion and the shared academic elements.
         *
         * @param totalScore             final affinity score
         * @param researchLineScore      score contributed by research lines
         * @param doctoralProgramScore   score contributed by doctoral programs
         * @param availabilityScore      score contributed by professor availability
         * @param matchingResearchLines  number of shared research lines
         * @param maxResearchLines       maximum number of research lines considered in
         *                               the comparison
         * @param matchingPrograms       number of shared doctoral programs
         * @param maxPrograms            maximum number of doctoral programs considered
         *                               in the comparison
         * @param sharedResearchLines    names of shared research lines
         * @param sharedDoctoralPrograms names of shared doctoral programs
         * @param availableProfessor     whether the professor is available to supervise
         * @return detailed textual explanation of the match result
         */
        private String buildDetailedExplanation(
                        double totalScore,
                        double researchLineScore,
                        double doctoralProgramScore,
                        double availabilityScore,
                        int matchingResearchLines,
                        int maxResearchLines,
                        int matchingPrograms,
                        int maxPrograms,
                        List<String> sharedResearchLines,
                        List<String> sharedDoctoralPrograms,
                        boolean availableProfessor) {
                StringBuilder explanation = new StringBuilder();

                explanation.append("Afinidad total: ")
                                .append((int) Math.round(totalScore))
                                .append("%.\n\n");

                explanation.append("Cálculo basado en tres criterios:\n");
                explanation.append("• Líneas de investigación (50%)\n");
                explanation.append("• Programas de doctorado (30%)\n");
                explanation.append("• Disponibilidad del profesor (20%)\n\n");

                explanation.append("Líneas de investigación: ")
                                .append(matchingResearchLines)
                                .append("/")
                                .append(maxResearchLines)
                                .append(" coincidencias -> ")
                                .append((int) Math.round(researchLineScore))
                                .append(" puntos.\n");

                if (!sharedResearchLines.isEmpty()) {
                        explanation.append("Coincidencias en líneas: ")
                                        .append(String.join(", ", sharedResearchLines))
                                        .append(".\n");
                } else {
                        explanation.append("No se han encontrado coincidencias en líneas de investigación.\n");
                }

                explanation.append("\nProgramas de doctorado: ")
                                .append(matchingPrograms)
                                .append("/")
                                .append(maxPrograms)
                                .append(" coincidencias -> ")
                                .append((int) Math.round(doctoralProgramScore))
                                .append(" puntos.\n");

                if (!sharedDoctoralPrograms.isEmpty()) {
                        explanation.append("Coincidencias en programas: ")
                                        .append(String.join(", ", sharedDoctoralPrograms))
                                        .append(".\n");
                } else {
                        explanation.append("No se han encontrado coincidencias en programas de doctorado.\n");
                }

                explanation.append("\nDisponibilidad del profesor: ");
                if (availableProfessor) {
                        explanation.append("+")
                                        .append((int) Math.round(availabilityScore))
                                        .append(" puntos (el profesor está disponible para dirigir tesis).");
                } else {
                        explanation.append(
                                        "0 puntos (el profesor no figura actualmente como disponible para dirigir tesis).");
                }

                explanation.append("\n\nTotal final: ")
                                .append((int) Math.round(totalScore))
                                .append("%.");

                return explanation.toString();
        }

        /**
         * Rounds a numeric value to two decimal places.
         *
         * @param value value to round
         * @return rounded value
         */
        private double round(double value) {
                return Math.round(value * 100.0) / 100.0;
        }
}