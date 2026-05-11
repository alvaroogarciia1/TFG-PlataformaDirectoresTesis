import { apiFetch } from "@/lib/api";
import { ThesisRequest } from "@/types/requests";

/**
 * This module centralizes all thesis request operations between students and
 * professors, including creation, retrieval and lifecycle management.
 */

/**
 * Payload used when a student sends a thesis request to a professor.
 */
export interface CreateStudentToProfessorRequest {
    /**
     * Identifier of the professor user who will receive the request.
     */
    professorUserId: number;

    /**
     * Subject of the thesis request.
     */
    subject: string;

    /**
     * Message body of the thesis request.
     */
    message: string;
}

/**
 * Payload used when a professor sends a thesis request to a student.
 */
export interface CreateProfessorToStudentRequest {
    /**
     * Identifier of the student user who will receive the request.
     */
    studentUserId: number;

    /**
     * Subject of the thesis request.
     */
    subject: string;

    /**
     * Message body of the thesis request.
     */
    message: string;
}

/**
 * Creates a thesis request from a student to a professor.
 *
 * @param body - Request payload.
 * @returns Created thesis request returned by the backend.
 */
export async function createRequest(
    body: CreateStudentToProfessorRequest
): Promise<ThesisRequest> {
    return apiFetch<ThesisRequest>("/requests", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Creates a thesis request from a professor to a student.
 *
 * @param body - Request payload.
 * @returns Created thesis request returned by the backend.
 */
export async function createRequestAsProfessor(
    body: CreateProfessorToStudentRequest
): Promise<ThesisRequest> {
    return apiFetch<ThesisRequest>("/requests/professor", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Retrieves the thesis requests sent by the authenticated user.
 *
 * @returns List of sent thesis requests.
 */
export async function getSentRequests(): Promise<ThesisRequest[]> {
    return apiFetch<ThesisRequest[]>("/requests/sent");
}

/**
 * Retrieves the thesis requests received by the authenticated user.
 *
 * @returns List of received thesis requests.
 */
export async function getReceivedRequests(): Promise<ThesisRequest[]> {
    return apiFetch<ThesisRequest[]>("/requests/received");
}

/**
 * Accepts a thesis request.
 *
 * @param id - Identifier of the request to accept.
 * @returns Updated thesis request returned by the backend.
 */
export async function acceptRequest(id: number): Promise<ThesisRequest> {
    return apiFetch<ThesisRequest>(`/requests/${id}/accept`, {
        method: "PATCH",
    });
}

/**
 * Rejects a thesis request.
 *
 * @param id - Identifier of the request to reject.
 * @param rejectionReason - Reason provided when the request was rejected.
 * @returns Updated thesis request returned by the backend.
 */
export async function rejectRequest(
    id: number,
    rejectionReason: string
): Promise<ThesisRequest> {
    return apiFetch<ThesisRequest>(`/requests/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectionReason }),
    });
}

/**
 * Cancels a thesis request.
 *
 * @param id - Identifier of the request to cancel.
 * @returns Updated thesis request returned by the backend.
 */
export async function cancelRequest(id: number): Promise<ThesisRequest> {
    return apiFetch<ThesisRequest>(`/requests/${id}/cancel`, {
        method: "PATCH",
    });
}