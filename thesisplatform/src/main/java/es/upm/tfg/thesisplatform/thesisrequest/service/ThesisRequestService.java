package es.upm.tfg.thesisplatform.thesisrequest.service;

import es.upm.tfg.thesisplatform.exception.*;
import es.upm.tfg.thesisplatform.mail.EmailService;
import es.upm.tfg.thesisplatform.professor.domain.ProfessorProfile;
import es.upm.tfg.thesisplatform.professor.repository.ProfessorProfileRepository;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.thesisrequest.domain.RequestInitiator;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequest;
import es.upm.tfg.thesisplatform.thesisrequest.domain.ThesisRequestStatus;
import es.upm.tfg.thesisplatform.thesisrequest.dto.CreateThesisRequestRequest;
import es.upm.tfg.thesisplatform.thesisrequest.dto.ProfessorThesisRequestCreate;
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
    private final EmailService emailService;

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
                .initiator(RequestInitiator.STUDENT)
                .build();

        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String subject = "Nueva solicitud de dirección de tesis";
        String body = "Hola,\n\n" +
                "Has recibido una nueva solicitud de dirección de tesis a través de la plataforma.\n\n" +
                "Estudiante: " + studentUser.getEmail() + "\n" +
                "Asunto: " + saved.getSubject() + "\n\n" +
                "Mensaje:\n" + saved.getMessage() + "\n\n" +
                "Puedes revisar la solicitud en la plataforma.";

        emailService.sendGenericEmail(professorUser.getEmail(), subject, body);

        return mapToResponse(saved);
    }

    public ThesisRequestResponse createFromProfessor(String professorEmail, ProfessorThesisRequestCreate request) {
        User professorUser = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Professor user not found"));

        if (professorUser.getRole() != UserRole.PROFESSOR) {
            throw new ForbiddenOperationException("Only users with PROFESSOR role can create thesis requests");
        }

        User studentUser = userRepository.findById(request.getStudentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        if (studentUser.getRole() != UserRole.STUDENT) {
            throw new InvalidThesisRequestOperationException("Selected user is not a student");
        }

        boolean alreadyPending = thesisRequestRepository.existsByStudentEmailAndProfessorIdAndStatus(
                studentUser.getEmail(),
                professorUser.getId(),
                ThesisRequestStatus.PENDING);

        if (alreadyPending) {
            throw new InvalidThesisRequestOperationException(
                    "A pending thesis request between this student and professor already exists");
        }

        ThesisRequest thesisRequest = ThesisRequest.builder()
                .student(studentUser)
                .professor(professorUser)
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .status(ThesisRequestStatus.PENDING)
                .initiator(RequestInitiator.PROFESSOR)
                .build();

        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String subject = "Nueva propuesta de dirección de tesis";
        String body = "Hola,\n\n" +
                "Has recibido una nueva propuesta de dirección de tesis a través de la plataforma.\n\n" +
                "Profesor: " + professorUser.getEmail() + "\n" +
                "Asunto: " + saved.getSubject() + "\n\n" +
                "Mensaje:\n" + saved.getMessage() + "\n\n" +
                "Puedes revisar la solicitud en la plataforma.";

        emailService.sendGenericEmail(studentUser.getEmail(), subject, body);

        return mapToResponse(saved);
    }

    public List<ThesisRequestResponse> getSentRequests(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getRole() == UserRole.STUDENT) {
            return thesisRequestRepository.findByStudentEmailOrderByCreatedAtDesc(currentUserEmail)
                    .stream()
                    .filter(request -> request.getInitiator() == RequestInitiator.STUDENT)
                    .map(this::mapToResponse)
                    .toList();
        }

        if (currentUser.getRole() == UserRole.PROFESSOR) {
            return thesisRequestRepository.findByProfessorEmailOrderByCreatedAtDesc(currentUserEmail)
                    .stream()
                    .filter(request -> request.getInitiator() == RequestInitiator.PROFESSOR)
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new ForbiddenOperationException("Only students or professors can access sent requests");
    }

    public List<ThesisRequestResponse> getReceivedRequests(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getRole() == UserRole.STUDENT) {
            return thesisRequestRepository.findByStudentEmailOrderByCreatedAtDesc(currentUserEmail)
                    .stream()
                    .filter(request -> request.getInitiator() == RequestInitiator.PROFESSOR)
                    .map(this::mapToResponse)
                    .toList();
        }

        if (currentUser.getRole() == UserRole.PROFESSOR) {
            return thesisRequestRepository.findByProfessorEmailOrderByCreatedAtDesc(currentUserEmail)
                    .stream()
                    .filter(request -> request.getInitiator() == RequestInitiator.STUDENT)
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new ForbiddenOperationException("Only students or professors can access received requests");
    }

    public ThesisRequestResponse acceptRequest(String currentUserEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be accepted");
        }

        if (thesisRequest.getInitiator() == RequestInitiator.STUDENT) {
            if (!thesisRequest.getProfessor().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the professor can accept this request");
            }
        } else {
            if (!thesisRequest.getStudent().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the student can accept this request");
            }
        }

        thesisRequest.setStatus(ThesisRequestStatus.ACCEPTED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String recipientEmail = thesisRequest.getInitiator() == RequestInitiator.STUDENT
                ? thesisRequest.getStudent().getEmail()
                : thesisRequest.getProfessor().getEmail();

        String subject = "Solicitud de tesis aceptada";
        String body = "Hola,\n\n" +
                "Tu solicitud de tesis con asunto \"" + saved.getSubject() + "\" ha sido aceptada.\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

        return mapToResponse(saved);
    }

    public ThesisRequestResponse rejectRequest(String currentUserEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be rejected");
        }

        if (thesisRequest.getInitiator() == RequestInitiator.STUDENT) {
            if (!thesisRequest.getProfessor().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the professor can reject this request");
            }
        } else {
            if (!thesisRequest.getStudent().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the student can reject this request");
            }
        }

        thesisRequest.setStatus(ThesisRequestStatus.REJECTED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String recipientEmail = thesisRequest.getInitiator() == RequestInitiator.STUDENT
                ? thesisRequest.getStudent().getEmail()
                : thesisRequest.getProfessor().getEmail();

        String subject = "Solicitud de tesis rechazada";
        String body = "Hola,\n\n" +
                "Tu solicitud de tesis con asunto \"" + saved.getSubject() + "\" ha sido rechazada.\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

        return mapToResponse(saved);
    }

    public ThesisRequestResponse cancelRequest(String currentUserEmail, Long requestId) {
        ThesisRequest thesisRequest = thesisRequestRepository.findById(requestId)
                .orElseThrow(() -> new ThesisRequestNotFoundException(requestId));

        if (thesisRequest.getStatus() != ThesisRequestStatus.PENDING) {
            throw new InvalidThesisRequestOperationException("Only pending requests can be cancelled");
        }

        if (thesisRequest.getInitiator() == RequestInitiator.STUDENT) {
            if (!thesisRequest.getStudent().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the creator can cancel this request");
            }
        } else {
            if (!thesisRequest.getProfessor().getEmail().equals(currentUserEmail)) {
                throw new ForbiddenOperationException("Only the creator can cancel this request");
            }
        }

        thesisRequest.setStatus(ThesisRequestStatus.CANCELLED);
        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String recipientEmail = thesisRequest.getInitiator() == RequestInitiator.STUDENT
                ? thesisRequest.getProfessor().getEmail()
                : thesisRequest.getStudent().getEmail();

        String subject = "Solicitud de tesis cancelada";
        String body = "Hola,\n\n" +
                "La solicitud de tesis con asunto \"" + saved.getSubject()
                + "\" ha sido cancelada por la persona que la creó.\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

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
                .initiator(thesisRequest.getInitiator())
                .createdAt(thesisRequest.getCreatedAt())
                .updatedAt(thesisRequest.getUpdatedAt())
                .build();
    }

    public List<ThesisRequestResponse> getAllRequestsForAdmin() {
        return thesisRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }
}