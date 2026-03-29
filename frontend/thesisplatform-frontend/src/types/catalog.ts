/**
 * Type representing a doctoral program entry from the backend catalog.
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
 * Type representing a research line entry from the backend catalog.
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