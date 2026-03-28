package es.upm.tfg.thesisplatform.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * DTO representing the result of an automatic matching operation.
 *
 * <p>
 * It contains the matched user's basic data, the detailed scoring breakdown,
 * shared academic attributes and a textual explanation of how the final
 * affinity
 * score was calculated.
 * </p>
 */
@Getter
@AllArgsConstructor
@Builder
public class MatchResultResponse {

    /**
     * Identifier of the matched user's account.
     */
    private Long userId;

    /**
     * Email address of the matched user.
     */
    private String email;

    /**
     * Full name of the matched user.
     */
    private String fullName;

    /**
     * Institution associated with the matched user.
     */
    private String institution;

    /**
     * Final total affinity score.
     */
    private double totalScore;

    /**
     * Partial score obtained from matching research lines.
     */
    private double researchLineScore;

    /**
     * Partial score obtained from matching doctoral programs.
     */
    private double doctoralProgramScore;

    /**
     * Partial score obtained from professor availability.
     */
    private double availabilityScore;

    /**
     * Number of shared research lines between the compared profiles.
     */
    private int matchingResearchLines;

    /**
     * Number of shared doctoral programs between the compared profiles.
     */
    private int matchingDoctoralPrograms;

    /**
     * Research lines associated with the matched user.
     */
    private List<String> researchLines;

    /**
     * Doctoral programs associated with the matched user.
     */
    private List<String> doctoralPrograms;

    /**
     * Human-readable explanation describing how the final score was computed.
     */
    private String matchExplanation;
}