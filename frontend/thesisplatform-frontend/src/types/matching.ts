/**
 * Type representing the result of an automatic matching process.
 *
 * <p>This structure is shared by both student-to-professor and
 * professor-to-student automatic affinity searches.</p>
 */
export interface MatchResult {
  /**
   * Identifier of the matched user's account.
   */
  userId: number;

  /**
   * Email address of the matched user.
   */
  email: string;

  /**
   * Full name of the matched user.
   */
  fullName: string;

  /**
   * Institution associated with the matched user.
   */
  institution: string;

  /**
   * Final total affinity score.
   */
  totalScore: number;

  /**
   * Partial score obtained from research line matching.
   */
  researchLineScore: number;

  /**
   * Partial score obtained from doctoral program matching.
   */
  doctoralProgramScore: number;

  /**
   * Partial score obtained from professor availability.
   */
  availabilityScore: number;

  /**
   * Number of coincident research lines between the compared profiles.
   */
  matchingResearchLines: number;

  /**
   * Number of coincident doctoral programs between the compared profiles.
   */
  matchingDoctoralPrograms: number;

  /**
   * Research lines associated with the matched user.
   */
  researchLines: string[];

  /**
   * Doctoral programs associated with the matched user.
   */
  doctoralPrograms: string[];

  /**
   * Human-readable explanation of how the match score was calculated.
   */
  matchExplanation: string;
}