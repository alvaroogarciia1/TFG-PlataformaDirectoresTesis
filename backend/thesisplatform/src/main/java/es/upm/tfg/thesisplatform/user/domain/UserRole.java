package es.upm.tfg.thesisplatform.user.domain;

/**
 * Enumeration representing the different roles supported by the platform.
 */
public enum UserRole {

    /**
     * User with student profile and student-specific functionality.
     */
    STUDENT,

    /**
     * User with professor profile and professor-specific functionality.
     */
    PROFESSOR,

    /**
     * User with administrative privileges over the system.
     */
    ADMIN
}