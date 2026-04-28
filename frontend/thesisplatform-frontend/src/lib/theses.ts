import { apiFetch } from "./api";
import type { SupervisedThesis, SupervisedThesisRequest } from "@/types/professor";

/**
 * This module centralizes all operations related to supervised theses managed
 * by the authenticated professor.
 */

/**
 * Retrieves the supervised theses of the authenticated professor.
 *
 * @returns List of supervised theses registered by the professor.
 */
export function getMySupervisedTheses(): Promise<SupervisedThesis[]> {
    return apiFetch<SupervisedThesis[]>("/professors/me/theses");
}

/**
 * Updates an existing supervised thesis owned by the authenticated professor.
 *
 * @param id - Identifier of the supervised thesis to update.
 * @param data - Updated supervised thesis data.
 * @returns Updated supervised thesis returned by the backend.
 */
export function updateSupervisedThesis(
    id: number,
    data: SupervisedThesisRequest
): Promise<SupervisedThesis> {
    return apiFetch<SupervisedThesis>(`/professors/me/theses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

/**
 * Creates a new supervised thesis for the authenticated professor.
 *
 * @param data - Supervised thesis data to create.
 * @returns Created supervised thesis returned by the backend.
 */
export function createSupervisedThesis(
    data: SupervisedThesisRequest
): Promise<SupervisedThesis> {
    return apiFetch<SupervisedThesis>("/professors/me/theses", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Deletes a supervised thesis by its identifier.
 *
 * @param id - Identifier of the supervised thesis to delete.
 */
export function deleteSupervisedThesis(id: number): Promise<void> {
    return apiFetch<void>(`/professors/me/theses/${id}`, {
        method: "DELETE",
    });
}