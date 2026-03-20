export interface MatchResult {
  userId: number;
  email: string;
  fullName: string;
  institution: string;
  totalScore: number;
  researchLineScore: number;
  doctoralProgramScore: number;
  availabilityScore: number;
  matchingResearchLines: number;
  matchingDoctoralPrograms: number;
  researchLines: string[];
  doctoralPrograms: string[];
  matchExplanation: string;
}