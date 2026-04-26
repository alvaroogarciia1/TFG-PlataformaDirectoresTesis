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

/**
 * Type representing a supervised thesis associated with a professor profile.
 *
 * <p>This structure is used to display thesis records previously supervised
 * or currently in progress by a professor.</p>
 */
export interface SupervisedThesis {
    /**
     * Unique identifier of the supervised thesis.
     */
    id: number;

    /**
     * Name of the doctoral student who carried out the thesis.
     */
    doctoralStudentName: string;

    /**
     * Title of the thesis.
     */
    thesisTitle: string;

    /**
     * Year in which the thesis was defended.
     */
    defenseYear: number | null;

    /**
     * Description or research lines of the thesis.
     */
    researchDescription: string;

    /**
     * Indicates whether the thesis has an industrial mention.
     */
    industrialMention: boolean;

    /**
     * Indicates whether the thesis has an international mention.
     */
    internationalMention: boolean;

    /**
     * Results obtained from the thesis (e.g., papers, patents).
     */
    results: string | null;

    /**
     * Indicates whether the thesis is currently ongoing.
     */
    ongoing: boolean;
}

/**
 * Type representing the data required to create a supervised thesis record.
 *
 * <p>This structure is used when a professor registers a new thesis
 * in the system.</p>
 */
export interface SupervisedThesisRequest {
    /**
     * Name of the doctoral student.
     */
    doctoralStudentName: string;

    /**
     * Title of the thesis.
     */
    thesisTitle: string;

    /**
     * Year of defense of the thesis.
     */
    defenseYear: number | null;

    /**
     * Description or research lines of the thesis.
     */
    researchDescription: string;

    /**
     * Indicates whether the thesis has an industrial mention.
     */
    industrialMention: boolean;

    /**
     * Indicates whether the thesis has an international mention.
     */
    internationalMention: boolean;

    /**
     * Results obtained from the thesis (e.g., papers, patents).
     */
    results: string | null;

    /**
     * Indicates whether the thesis is currently ongoing.
     */
    ongoing: boolean;
}