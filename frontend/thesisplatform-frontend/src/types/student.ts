/**
 * Type representing the public data of a student profile.
 *
 * This structure is used in student profile views, manual search
 * results and other frontend screens that display student information.
 */

export type DedicationType = "FULL_TIME" | "PART_TIME";

export interface StudentProfile {
    /**
     * Unique identifier of the student profile.
     */
    id: number;

    /**
     * Identifier of the associated user account.
     */
    userId: number;

    /**
     * Email address of the student.
     */
    email: string;

    /**
     * First name of the student.
     */
    firstName: string;

    /**
     * Last name of the student.
     */
    lastName: string;

    /**
     * Origin institution of the student.
     */
    originInstitution: string;

    /**
     * Motivation statement provided by the student.
     */
    motivation: string;

    /**
     * Proposed thesis title.
     */
    proposedThesisTitle: string;

    /**
     * Indicates whether the student currently has funding.
     */
    hasFunding: boolean;

    /**
     * Funding type, when available.
     */
    fundingType: string | null;

    /**
     * Funding duration in months, when available.
     */
    fundingDurationMonths: number | null;

    /**
     * Indicates whether the student is willing to relocate to Madrid.
     */
    willingToRelocateToMadrid: boolean;

    /**
     * Expected dedication type for doctoral studies.
     */
    dedicationType: DedicationType;

    /**
     * Additional information provided by the student.
     */
    additionalInformation: string | null;

    /**
     * Public URL or reference to the student CV.
     */
    cvUrl: string;

    /**
     * Names of the doctoral programs associated with the student.
     */
    doctoralPrograms: string[];

    /**
     * Names of the research lines associated with the student.
     */
    researchLines: string[];
}