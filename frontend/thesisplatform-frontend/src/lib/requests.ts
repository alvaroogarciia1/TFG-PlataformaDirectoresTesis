import { apiFetch } from "@/lib/api";
import { ThesisRequest } from "@/types/requests";

export interface CreateStudentToProfessorRequest {
    professorUserId: number;
    subject: string;
    message: string;
}

export interface CreateProfessorToStudentRequest {
    studentUserId: number;
    subject: string;
    message: string;
}

export async function createRequest(body: CreateStudentToProfessorRequest) {
    return apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createRequestAsProfessor(body: CreateProfessorToStudentRequest) {
    return apiFetch("/requests/professor", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getSentRequests(): Promise<ThesisRequest[]> {
    return apiFetch("/requests/sent");
}

export async function getReceivedRequests(): Promise<ThesisRequest[]> {
    return apiFetch("/requests/received");
}

export async function acceptRequest(id: number) {
    return apiFetch(`/requests/${id}/accept`, {
        method: "PATCH",
    });
}

export async function rejectRequest(id: number) {
    return apiFetch(`/requests/${id}/reject`, {
        method: "PATCH",
    });
}

export async function cancelRequest(id: number) {
    return apiFetch(`/requests/${id}/cancel`, {
        method: "PATCH",
    });
}