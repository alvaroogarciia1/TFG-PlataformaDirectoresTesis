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

/**
 * Service responsible for managing thesis direction requests.
 *
 * <p>
 * This service encapsulates the business logic for:
 * <ul>
 * <li>Creating requests initiated by students or professors</li>
 * <li>Retrieving sent and received requests</li>
 * <li>Accepting, rejecting and cancelling requests</li>
 * <li>Sending email notifications associated with request lifecycle events</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ThesisRequestService {

    /**
     * Repository used to access thesis requests.
     */
    private final ThesisRequestRepository thesisRequestRepository;

    /**
     * Repository used to access users.
     */
    private final UserRepository userRepository;

    /**
     * Repository used to access student profiles.
     */
    private final StudentProfileRepository studentProfileRepository;

    /**
     * Repository used to access professor profiles.
     */
    private final ProfessorProfileRepository professorProfileRepository;

    /**
     * Service used to send email notifications.
     */
    private final EmailService emailService;

    /**
     * Creates a new thesis request initiated by a student and addressed to a
     * professor.
     *
     * @param studentEmail email of the authenticated student
     * @param request      request DTO containing the professor and request content
     * @return created thesis request response
     * @throws ResourceNotFoundException              if the student or professor
     *                                                user does not exist
     * @throws ForbiddenOperationException            if the authenticated user is
     *                                                not a student
     * @throws InvalidThesisRequestOperationException if the selected recipient is
     *                                                not a professor
     *                                                or if a pending request
     *                                                already exists
     */
    public ThesisRequestResponse createFromStudent(String studentEmail, CreateThesisRequestRequest request) {
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
                    "Ya existe una solicitud de tesis pendiente para este profesor");
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
        String body = "Has recibido una nueva solicitud de dirección de tesis a través de ThesisMatch.\n\n" +
                "Estudiante: " + studentUser.getEmail() + "\n" +
                "Asunto: " + saved.getSubject() + "\n\n" +
                "Mensaje:\n" + saved.getMessage() + "\n\n" +
                "Puedes revisar esta solicitud en la plataforma.";

        emailService.sendGenericEmail(professorUser.getEmail(), subject, body);

        return mapToResponse(saved);
    }

    /**
     * Creates a new thesis request initiated by a professor and addressed to a
     * student.
     *
     * @param professorEmail email of the authenticated professor
     * @param request        request DTO containing the student and request content
     * @return created thesis request response
     * @throws ResourceNotFoundException              if the professor or student
     *                                                user does not exist
     * @throws ForbiddenOperationException            if the authenticated user is
     *                                                not a professor
     * @throws InvalidThesisRequestOperationException if the selected recipient is
     *                                                not a student
     *                                                or if a pending request
     *                                                already exists
     */
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
                    "Ya existe una solicitud de tesis pendiente para este estudiante");
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
        String body = "Has recibido una nueva propuesta de dirección de tesis a través de ThesisMatch.\n\n" +
                "Profesor: " + professorUser.getEmail() + "\n" +
                "Asunto: " + saved.getSubject() + "\n\n" +
                "Mensaje:\n" + saved.getMessage() + "\n\n" +
                "Puedes revisar esta solicitud en la plataforma.";

        emailService.sendGenericEmail(studentUser.getEmail(), subject, body);

        return mapToResponse(saved);
    }

    /**
     * Retrieves the requests sent by the authenticated user.
     *
     * <p>
     * For students, this method returns requests initiated by students.
     * For professors, it returns requests initiated by professors.
     * </p>
     *
     * @param currentUserEmail email of the authenticated user
     * @return list of sent thesis requests
     * @throws ResourceNotFoundException   if the user does not exist
     * @throws ForbiddenOperationException if the user is neither student nor
     *                                     professor
     */
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

    /**
     * Retrieves the requests received by the authenticated user.
     *
     * <p>
     * For students, this method returns requests initiated by professors.
     * For professors, it returns requests initiated by students.
     * </p>
     *
     * @param currentUserEmail email of the authenticated user
     * @return list of received thesis requests
     * @throws ResourceNotFoundException   if the user does not exist
     * @throws ForbiddenOperationException if the user is neither student nor
     *                                     professor
     */
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

    /**
     * Accepts a pending thesis request if the authenticated user is the correct
     * receiver.
     *
     * @param currentUserEmail email of the authenticated user
     * @param requestId        identifier of the request to accept
     * @return updated thesis request response
     * @throws ThesisRequestNotFoundException         if the request does not exist
     * @throws InvalidThesisRequestOperationException if the request is not pending
     * @throws ForbiddenOperationException            if the authenticated user is
     *                                                not allowed to accept it
     */
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
        String body = "La solicitud de tesis con asunto \"" + saved.getSubject() + "\" ha sido aceptada.\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

        return mapToResponse(saved);
    }

    /**
     * Rejects a pending thesis request if the authenticated user is the correct
     * receiver.
     *
     * @param currentUserEmail email of the authenticated user
     * @param requestId        identifier of the request to reject
     * @param rejectionReason  the reason why the request was rejected
     * @return updated thesis request response
     * @throws ThesisRequestNotFoundException         if the request does not exist
     * @throws InvalidThesisRequestOperationException if the request is not pending
     * @throws ForbiddenOperationException            if the authenticated user is
     *                                                not allowed to reject it
     */
    public ThesisRequestResponse rejectRequest(String currentUserEmail, Long requestId, String rejectionReason) {
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

        String normalizedReason = rejectionReason == null ? "" : rejectionReason.trim();

        if (normalizedReason.isEmpty()) {
            throw new InvalidThesisRequestOperationException("Rejection reason is required");
        }

        thesisRequest.setStatus(ThesisRequestStatus.REJECTED);
        thesisRequest.setRejectionReason(normalizedReason);

        ThesisRequest saved = thesisRequestRepository.save(thesisRequest);

        String recipientEmail = thesisRequest.getInitiator() == RequestInitiator.STUDENT
                ? thesisRequest.getStudent().getEmail()
                : thesisRequest.getProfessor().getEmail();

        String subject = "Solicitud de tesis rechazada";
        String body = "La solicitud de tesis con asunto \"" + saved.getSubject() + "\" ha sido rechazada.\n\n" +
                "Motivo del rechazo:\n" + saved.getRejectionReason() + "\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

        return mapToResponse(saved);
    }

    /**
     * Cancels a pending thesis request if the authenticated user is the creator.
     *
     * @param currentUserEmail email of the authenticated user
     * @param requestId        identifier of the request to cancel
     * @return updated thesis request response
     * @throws ThesisRequestNotFoundException         if the request does not exist
     * @throws InvalidThesisRequestOperationException if the request is not pending
     * @throws ForbiddenOperationException            if the authenticated user is
     *                                                not the creator
     */
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
        String body = "La solicitud de tesis con asunto \"" + saved.getSubject()
                + "\" ha sido cancelada por la persona que la envió.\n\n" +
                "Puedes revisar el estado actualizado en la plataforma.";

        emailService.sendGenericEmail(recipientEmail, subject, body);

        return mapToResponse(saved);
    }

    /**
     * Maps a thesis request entity to its response DTO.
     *
     * <p>
     * Whenever possible, this method resolves the full names of the student
     * and professor from their associated academic profiles.
     * </p>
     *
     * @param thesisRequest thesis request entity
     * @return mapped thesis request response
     */
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
                .rejectionReason(thesisRequest.getRejectionReason())
                .status(thesisRequest.getStatus())
                .initiator(thesisRequest.getInitiator())
                .createdAt(thesisRequest.getCreatedAt())
                .updatedAt(thesisRequest.getUpdatedAt())
                .build();
    }

    /**
     * Retrieves all thesis requests in the system for administrative purposes.
     *
     * @return list of all thesis request responses
     */
    public List<ThesisRequestResponse> getAllRequestsForAdmin() {
        return thesisRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }
}