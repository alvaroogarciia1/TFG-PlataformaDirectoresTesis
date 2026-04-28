/**
 * Type representing the result of an automatic matching process.
 *
 * This structure is shared by both student-to-professor and
 * professor-to-student automatic affinity searches.
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
   * Final affinity score expressed as a percentage (0–100).
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
   * Partial score related to professor availability (only applicable when matching professors).
   */
  availabilityScore: number;

  /**
   * Number of matching research lines between both profiles.
   */
  matchingResearchLines: number;

  /**
   * Number of matching doctoral programs between both profiles.
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
   * Human-readable explanation describing how the affinity score was calculated.
   *
   * This field is used to provide transparency to the user about the matching process.
   */
  matchExplanation: string;
}