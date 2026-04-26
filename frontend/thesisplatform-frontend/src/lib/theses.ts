import { apiFetch } from "./api";
import type { SupervisedThesis, SupervisedThesisRequest } from "@/types/professor";

/**
 * Retrieves the supervised theses of the authenticated professor.
 */
export function getMySupervisedTheses() {
    return apiFetch<SupervisedThesis[]>("/professors/me/theses");
}

/**
 * Creates a new supervised thesis for the authenticated professor.
 */
export function createSupervisedThesis(data: SupervisedThesisRequest) {
    return apiFetch<SupervisedThesis>("/professors/me/theses", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Deletes a supervised thesis by its identifier.
 */
export function deleteSupervisedThesis(id: number) {
    return apiFetch<void>(`/professors/me/theses/${id}`, {
        method: "DELETE",
    });
}