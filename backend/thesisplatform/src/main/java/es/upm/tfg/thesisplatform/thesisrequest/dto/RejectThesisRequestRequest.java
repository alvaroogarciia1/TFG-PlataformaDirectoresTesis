package es.upm.tfg.thesisplatform.thesisrequest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO used when rejecting a thesis request.
 *
 * <p>
 * It contains the reason provided by the receiving user when rejecting
 * the request. This reason is stored and also included in the email
 * notification sent to the original requester.
 * </p>
 */
@Getter
@Setter
public class RejectThesisRequestRequest {

    /**
     * Reason explaining why the request has been rejected.
     */
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}