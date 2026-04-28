import { apiFetch } from "@/lib/api";
import { ProfessorProfile } from "@/types/professor";
import { StudentProfile } from "@/types/student";

/**
 * This module centralizes all search operations for professors and students,
 * including both simple name-based queries and advanced filtered searches.
 */

/**
 * Payload used for advanced professor search.
 *
 * <p>All fields are optional and correspond to the filters supported
 * by the backend manual search endpoint.</p>
 */
export interface ProfessorAdvancedSearchRequest {
    /**
     * Doctoral program identifiers used as filter.
     */
    doctoralProgramIds?: number[];

    /**
     * Research line identifiers used as filter.
     */
    researchLineIds?: number[];

    /**
     * Availability filter.
     */
    availableToSupervise?: boolean;

    /**
     * Institution text filter.
     */
    institution?: string;
}

/**
 * Payload used for advanced student search.
 *
 * <p>All fields are optional and correspond to the filters supported
 * by the backend manual search endpoint.</p>
 */
export interface StudentAdvancedSearchRequest {
    /**
     * Doctoral program identifiers used as filter.
     */
    doctoralProgramIds?: number[];

    /**
     * Research line identifiers used as filter.
     */
    researchLineIds?: number[];

    /**
     * Funding availability filter.
     */
    hasFunding?: boolean;

    /**
     * Relocation availability filter.
     */
    willingToRelocateToMadrid?: boolean;

    /**
     * Dedication type filter.
     */
    dedicationType?: string;

    /**
     * Origin institution text filter.
     */
    originInstitution?: string;
}

/**
 * Searches professors by name using the public search endpoint.
 *
 * @param name - Full-name fragment to search.
 * @returns List of professor profiles matching the query.
 */
export async function searchProfessorsByName(
    name: string
): Promise<ProfessorProfile[]> {
    return apiFetch<ProfessorProfile[]>(
        `/professors/search?name=${encodeURIComponent(name)}`,
        {},
        false // public endpoint (no auth required)
    );
}

/**
 * Searches professors using advanced structured filters.
 *
 * @param body - Advanced search payload.
 * @returns List of professor profiles matching the provided filters.
 */
export async function searchProfessorsAdvanced(
    body: ProfessorAdvancedSearchRequest
): Promise<ProfessorProfile[]> {
    return apiFetch<ProfessorProfile[]>("/professors/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Searches students by full name using the search endpoint.
 *
 * @param name - Full-name fragment to search.
 * @returns List of student profiles matching the query.
 */
export async function searchStudentsByName(
    name: string
): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>(
        `/students/search?name=${encodeURIComponent(name)}`,
        {},
        false // public endpoint (no auth required)
    );
}

/**
 * Searches students using advanced structured filters.
 *
 * @param body - Advanced search payload.
 * @returns List of student profiles matching the provided filters.
 */
export async function searchStudentsAdvanced(
    body: StudentAdvancedSearchRequest
): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>("/students/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}