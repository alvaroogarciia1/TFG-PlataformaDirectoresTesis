import { apiFetch } from "@/lib/api";
import { ThesisRequest } from "@/types/requests";

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
 * @param body request payload
 * @returns backend response of the created request
 */
export async function createRequest(body: CreateStudentToProfessorRequest) {
    return apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Creates a thesis request from a professor to a student.
 *
 * @param body request payload
 * @returns backend response of the created request
 */
export async function createRequestAsProfessor(body: CreateProfessorToStudentRequest) {
    return apiFetch("/requests/professor", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Retrieves the thesis requests sent by the authenticated user.
 *
 * @returns list of sent thesis requests
 */
export async function getSentRequests(): Promise<ThesisRequest[]> {
    return apiFetch("/requests/sent");
}

/**
 * Retrieves the thesis requests received by the authenticated user.
 *
 * @returns list of received thesis requests
 */
export async function getReceivedRequests(): Promise<ThesisRequest[]> {
    return apiFetch("/requests/received");
}

/**
 * Accepts a thesis request.
 *
 * @param id identifier of the request to accept
 * @returns backend response with updated request state
 */
export async function acceptRequest(id: number) {
    return apiFetch(`/requests/${id}/accept`, {
        method: "PATCH",
    });
}

/**
 * Rejects a thesis request.
 *
 * @param id identifier of the request to reject
 * @returns backend response with updated request state
 */
export async function rejectRequest(id: number) {
    return apiFetch(`/requests/${id}/reject`, {
        method: "PATCH",
    });
}

/**
 * Cancels a thesis request.
 *
 * @param id identifier of the request to cancel
 * @returns backend response with updated request state
 */
export async function cancelRequest(id: number) {
    return apiFetch(`/requests/${id}/cancel`, {
        method: "PATCH",
    });
}