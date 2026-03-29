package es.upm.tfg.thesisplatform.thesisrequest.domain;

/**
 * Enumeration representing the lifecycle state of a thesis request.
 */
public enum ThesisRequestStatus {

    /**
     * The request has been created and is awaiting a response.
     */
    PENDING,

    /**
     * The request has been accepted by the receiving party.
     */
    ACCEPTED,

    /**
     * The request has been rejected by the receiving party.
     */
    REJECTED,

    /**
     * The request has been cancelled by the creator.
     */
    CANCELLED
}