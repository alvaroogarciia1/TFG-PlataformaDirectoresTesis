export interface ProfessorProfile {
    id: number;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    institution: string;
    department: string | null;
    availableToSupervise: boolean;
    maxPhdStudents: number | null;
    additionalInformation: string | null;
    cvUrl: string;
    doctoralPrograms: string[];
    researchLines: string[];
}