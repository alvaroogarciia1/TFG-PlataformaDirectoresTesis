package es.upm.tfg.thesisplatform.thesisrequest.repository;

import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequest;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import es.upm.tfg.thesisplatform.user.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for accessing and querying thesis requests.
 */
public interface ThesisRequestRepository extends JpaRepository<ThesisRequest, Long> {

    /**
     * Retrieves all requests related to a student, ordered by creation date
     * descending.
     *
     * @param studentEmail email of the student user
     * @return list of thesis requests
     */
    List<ThesisRequest> findByStudentEmailOrderByCreatedAtDesc(String studentEmail);

    /**
     * Retrieves all requests related to a professor, ordered by creation date
     * descending.
     *
     * @param professorEmail email of the professor user
     * @return list of thesis requests
     */
    List<ThesisRequest> findByProfessorEmailOrderByCreatedAtDesc(String professorEmail);

    /**
     * Checks whether a request with the given student, professor and status already
     * exists.
     *
     * @param studentEmail    email of the student
     * @param professorUserId identifier of the professor user
     * @param status          request status to check
     * @return {@code true} if a matching request exists; {@code false} otherwise
     */
    boolean existsByStudentEmailAndProfessorIdAndStatus(
            String studentEmail,
            Long professorUserId,
            ThesisRequestStatus status);

    /**
     * Deletes all requests where the given users appear as student or professor.
     *
     * @param student   student user
     * @param professor professor user
     */
    void deleteByStudentOrProfessor(User student, User professor);
}