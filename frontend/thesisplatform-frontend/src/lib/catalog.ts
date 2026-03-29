import { apiFetch } from "@/lib/api";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";

/**
 * Retrieves the catalog of doctoral programs from the backend.
 *
 * @returns list of doctoral programs available in the platform
 */
export async function getDoctoralPrograms(): Promise<DoctoralProgram[]> {
    return apiFetch<DoctoralProgram[]>("/catalog/doctoral-programs");
}

/**
 * Retrieves the catalog of research lines from the backend.
 *
 * @returns list of research lines available in the platform
 */
export async function getResearchLines(): Promise<ResearchLine[]> {
    return apiFetch<ResearchLine[]>("/catalog/research-lines");
}