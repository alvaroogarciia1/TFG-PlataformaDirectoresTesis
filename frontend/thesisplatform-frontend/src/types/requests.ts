/**
 * Union type representing the possible states of a thesis request.
 */
export type ThesisRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

/**
 * Union type representing who originally created a thesis request.
 */
export type RequestInitiator = "STUDENT" | "PROFESSOR";

/**
 * Type representing a thesis direction request exchanged between
 * a student and a professor.
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
     * Current request status.
     */
    status: ThesisRequestStatus;

    /**
     * Role that originally created the request.
     */
    initiator: RequestInitiator;

    /**
     * Request creation timestamp in ISO string format.
     */
    createdAt: string;

    /**
     * Request last update timestamp in ISO string format.
     */
    updatedAt: string;
}