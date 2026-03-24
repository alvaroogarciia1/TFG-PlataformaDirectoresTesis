import { apiFetch } from "@/lib/api";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";

export async function getDoctoralPrograms(): Promise<DoctoralProgram[]> {
    return apiFetch<DoctoralProgram[]>("/catalog/doctoral-programs");
}

export async function getResearchLines(): Promise<ResearchLine[]> {
    return apiFetch<ResearchLine[]>("/catalog/research-lines");
}