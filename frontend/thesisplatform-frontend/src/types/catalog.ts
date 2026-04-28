/**
 * Doctoral program entity returned by the backend catalog.
 */
export interface DoctoralProgram {
    /**
     * Unique identifier of the doctoral program.
     */
    id: number;

    /**
     * Name of the doctoral program.
     */
    name: string;
}

/**
 * Research line entity returned by the backend catalog.
 */
export interface ResearchLine {
    /**
     * Unique identifier of the research line.
     */
    id: number;

    /**
     * Name of the research line.
     */
    name: string;
}