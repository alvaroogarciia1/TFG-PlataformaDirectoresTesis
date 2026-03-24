export interface StudentProfile {
    id: number;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    originInstitution: string;
    motivation: string;
    proposedThesisTitle: string;
    hasFunding: boolean;
    fundingType: string | null;
    fundingDurationMonths: number | null;
    willingToRelocateToMadrid: boolean;
    dedicationType: string;
    additionalInformation: string | null;
    cvUrl: string;
    doctoralPrograms: string[];
    researchLines: string[];
}