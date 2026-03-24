import { apiFetch } from "@/lib/api";
import { ProfessorProfile } from "@/types/professor";
import { StudentProfile } from "@/types/student";

export interface ProfessorAdvancedSearchRequest {
    doctoralProgramIds?: number[];
    researchLineIds?: number[];
    availableToSupervise?: boolean;
    institution?: string;
}

export interface StudentAdvancedSearchRequest {
    doctoralProgramIds?: number[];
    researchLineIds?: number[];
    hasFunding?: boolean;
    willingToRelocateToMadrid?: boolean;
    dedicationType?: string;
    originInstitution?: string;
}

export async function searchProfessorsByName(name: string): Promise<ProfessorProfile[]> {
    return apiFetch<ProfessorProfile[]>(
        `/professors/search?name=${encodeURIComponent(name)}`
    );
}

export async function searchProfessorsAdvanced(
    body: ProfessorAdvancedSearchRequest
): Promise<ProfessorProfile[]> {
    return apiFetch<ProfessorProfile[]>("/professors/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function searchStudentsByTitle(title: string): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>(
        `/students/search?title=${encodeURIComponent(title)}`
    );
}

export async function searchStudentsAdvanced(
    body: StudentAdvancedSearchRequest
): Promise<StudentProfile[]> {
    return apiFetch<StudentProfile[]>("/students/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}