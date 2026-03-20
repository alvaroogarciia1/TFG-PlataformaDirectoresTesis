package es.upm.tfg.thesisplatform.thesisrequest.repository;

import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequest;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThesisRequestRepository extends JpaRepository<ThesisRequest, Long> {

    List<ThesisRequest> findByStudentEmailOrderByCreatedAtDesc(String studentEmail);

    List<ThesisRequest> findByProfessorEmailOrderByCreatedAtDesc(String professorEmail);

    boolean existsByStudentEmailAndProfessorIdAndStatus(
            String studentEmail,
            Long professorUserId,
            ThesisRequestStatus status);
}