/**
 * Type representing the public data of a professor profile.
 *
 * <p>This structure is used in professor profile views, manual search
 * results and other frontend screens that display professor information.</p>
 */
export interface ProfessorProfile {
    /**
     * Unique identifier of the professor profile.
     */
    id: number;

    /**
     * Identifier of the associated user account.
     */
    userId: number;

    /**
     * Email address of the professor.
     */
    email: string;

    /**
     * First name of the professor.
     */
    firstName: string;

    /**
     * Last name of the professor.
     */
    lastName: string;

    /**
     * Institution of the professor.
     */
    institution: string;

    /**
     * Department or academic unit of the professor.
     */
    department: string | null;

    /**
     * Indicates whether the professor is currently available to supervise.
     */
    availableToSupervise: boolean;

    /**
     * Maximum number of PhD students accepted by the professor.
     */
    maxPhdStudents: number | null;

    /**
     * Additional information provided by the professor.
     */
    additionalInformation: string | null;

    /**
     * Public URL or reference to the professor CV.
     */
    cvUrl: string;

    /**
     * Names of the doctoral programs associated with the professor.
     */
    doctoralPrograms: string[];

    /**
     * Names of the research lines associated with the professor.
     */
    researchLines: string[];
}