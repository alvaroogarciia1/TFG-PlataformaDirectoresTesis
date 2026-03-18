package es.upm.tfg.thesisplatform.thesisrequest.service;

import es.upm.tfg.thesisplatform.exception.*;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequest;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import es.upm.tfg.thesisplatform.thesisrequest.dto.CreateThesisRequestRequest;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ThesisRequestResponse;
import es.upm.tfg.thesisplatform.thesisrequest.repository.ThesisRequestRepository;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThesisRequestService {

    private final ThesisRequestRepository thesisRequestRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProfessorProfileRepository professorProfileRepository;

    public ThesisRequestResponse create(String studentEmail, CreateThesisRequestRequest request) {
        User studentUser = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        if (studentUser.getRole() != UserRole.STUDENT) {
            throw new ForbiddenOperationException("Only users with STUDENT role can create thesis requests");
        }

        User professorUser = userRepository.findById(request.getProfessorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Professor user not found"));

        if (professorUser.getRole() != UserRole.PROFESSOR) {
            throw new InvalidThesisRequestOperationException("Selected user is not a professor");
        }

        boolean alreadyPending = thesisRequestRepository.existsByStudentEmailAndProfessorIdAndStatus(
                studentEmail,
                request.getProfessorUserId(),
                ThesisRequestStatus.PENDING);

        if (alreadyPending) {
            throw new InvalidThesisRequestOperationException(
                    "A pending thesis request to this professor already exists");
        }

        ThesisRequest thesisRequest = ThesisRequest.builder()
                .student(studentUser)
                .professor(professorUser)
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .status(ThesisRequestStatus.PENDING)
                .build();

        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);
        return mapToResponse(saved);
    }

    public List<ThesisRequestResponse> getSentRequests(String studentEmail) {
        return thesisRequestRepository.findByStudentEmailOrderByCreatedAtDesc(studentEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ThesisRequestResponse> getReceivedRequests(String professorEmail) {
        return thesisRequestRepository.findByProfessorEmailOrderByCreatedAtDesc(professorEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ThesisRequestResponse acceptRequest(String professorEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (!thesisRequest.getProfessor().getEmail().equals(professorEmail)) {
            throw new ForbiddenOperationException("You cannot accept a request that is not assigned to you");
        }

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be accepted");
        }

        thesisRequest.setStatus(ThesisRequestStatus.ACCEPTED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        return mapToResponse(saved);
    }

    public ThesisRequestResponse rejectRequest(String professorEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (!thesisRequest.getProfessor().getEmail().equals(professorEmail)) {
            throw new ForbiddenOperationException("You cannot reject a request that is not assigned to you");
        }

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be rejected");
        }

        thesisRequest.setStatus(ThesisRequestStatus.REJECTED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        return mapToResponse(saved);
    }

    public ThesisRequestResponse cancelRequest(String studentEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (!thesisRequest.getStudent().getEmail().equals(studentEmail)) {
            throw new ForbiddenOperationException("You cannot cancel a request that is not yours");
        }

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be cancelled");
        }

        thesisRequest.setStatus(ThesisRequestStatus.CANCELLED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        return mapToResponse(saved);
    }

    private ThesisRequestResponse mapToResponse(ThesisRequest thesisRequest) {
        StudentProfile studentProfile = studentProfileRepository.findByUserEmail(thesisRequest.getStudent().getEmail())
                .orElse(null);

        ProfessorProfile professorProfile = professorProfileRepository
                .findByUserEmail(thesisRequest.getProfessor().getEmail())
                .orElse(null);

        String studentFullName = studentProfile != null
                ? studentProfile.getFirstName() + " " + studentProfile.getLastName()
                : thesisRequest.getStudent().getEmail();

        String professorFullName = professorProfile != null
                ? professorProfile.getFirstName() + " " + professorProfile.getLastName()
                : thesisRequest.getProfessor().getEmail();

        return ThesisRequestResponse.builder()
                .id(thesisRequest.getId())
                .studentUserId(thesisRequest.getStudent().getId())
                .studentEmail(thesisRequest.getStudent().getEmail())
                .studentFullName(studentFullName)
                .professorUserId(thesisRequest.getProfessor().getId())
                .professorEmail(thesisRequest.getProfessor().getEmail())
                .professorFullName(professorFullName)
                .subject(thesisRequest.getSubject())
                .message(thesisRequest.getMessage())
                .status(thesisRequest.getStatus())
                .createdAt(thesisRequest.getCreatedAt())
                .updatedAt(thesisRequest.getUpdatedAt())
                .build();
    }
}