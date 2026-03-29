import { apiFetch } from "@/lib/api";
import { ProfessorProfile } from "@/types/professor";
import { StudentProfile } from "@/types/student";

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
 * @param name full-name fragment to search
 * @returns list of professor profiles matching the query
 */
export async function searchProfessorsByName(name: string): Promise<ProfessorProfile[]> {
    return apiFetch<ProfessorProfile[]>(
        `/professors/search?name=${encodeURIComponent(name)}`
    );
}

/**
 * Searches professors using advanced structured filters.
 *
 * @param body advanced search payload
 * @returns list of professor profiles matching the provided filters
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
 * Searches students by proposed thesis title using the public search endpoint.
 *
 * @param title thesis title fragment to search
 * @returns list of student profiles matching the query
 */
export async function searchStudentsByTitle(title: string): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>(
        `/students/search?title=${encodeURIComponent(title)}`
    );
}

/**
 * Searches students using advanced structured filters.
 *
 * @param body advanced search payload
 * @returns list of student profiles matching the provided filters
 */
export async function searchStudentsAdvanced(
    body: StudentAdvancedSearchRequest
): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>("/students/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}