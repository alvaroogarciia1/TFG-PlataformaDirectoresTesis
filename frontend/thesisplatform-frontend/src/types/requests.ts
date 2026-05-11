/**
 * Union type representing the possible states of a thesis request.
 * Possible states of a thesis request during its lifecycle:
 * - PENDING: request has been sent and is awaiting response
 * - ACCEPTED: request has been approved
 * - REJECTED: request has been declined
 * - CANCELLED: request has been withdrawn by the initiator
 */
export type ThesisRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

/**
 * Union type representing who originally created a thesis request.
 */
export type RequestInitiator = "STUDENT" | "PROFESSOR";

/**
 * Type representing a thesis direction request exchanged between
 * a student and a professor.
 *
 * This structure models the formal communication process used in the platform
 * to initiate, accept, reject or cancel thesis supervision proposals.
 */
export interface ThesisRequest {
    /**
     * Unique identifier of the thesis request.
     */
    id: number;

    /**
     * Identifier of the student user involved in the request.
     */
    studentUserId: number;

    /**
     * Email address of the student.
     */
    studentEmail: string;

    /**
     * Full name of the student.
     */
    studentFullName: string;

    /**
     * Identifier of the professor user involved in the request.
     */
    professorUserId: number;

    /**
     * Email address of the professor.
     */
    professorEmail: string;

    /**
     * Full name of the professor.
     */
    professorFullName: string;

    /**
     * Subject of the request.
     */
    subject: string;

    /**
     * Message body of the request.
     */
    message: string;

    /**
 * Reason provided when the request was rejected.
 */
    rejectionReason?: string | null;

    /**
     * Current state of the request within its lifecycle.
     */
    status: ThesisRequestStatus;

    /**
     * Role of the user who initiated the request.
     *
     * Determines whether the request was created by a student or a professor.
     */
    initiator: RequestInitiator;

    /**
     * Timestamp indicating when the request was created (ISO 8601 format).
     */
    createdAt: string;

    /**
     * Timestamp indicating the last update of the request (ISO 8601 format).
     */
    updatedAt: string;
}