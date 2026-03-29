package es.upm.tfg.thesisplatform.thesisrequest.domain;

/**
 * Enumeration representing the role that originally created a thesis request.
 */
public enum RequestInitiator {

    /**
     * Request created by a student and sent to a professor.
     */
    STUDENT,

    /**
     * Request created by a professor and sent to a student.
     */
    PROFESSOR
}