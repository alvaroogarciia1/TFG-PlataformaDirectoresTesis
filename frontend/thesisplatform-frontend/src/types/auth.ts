/**
 * Union type representing all user roles supported by the platform.
 */
export type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";

/**
 * Payload used when a user attempts to log into the platform.
 */
export interface LoginRequest {
  /**
   * Email address used as login identifier.
   */
  email: string;

  /**
   * Plain-text password entered by the user.
   */
  password: string;
}

/**
 * Payload used when a user registers a new account in the platform.
 */
export interface RegisterRequest {
  /**
   * Email address of the new account.
   */
  email: string;

  /**
   * Plain-text password chosen by the user.
   */
  password: string;

  /**
   * Role selected during registration.
   */
  role: UserRole;
}

/**
 * Authentication response returned by the backend after a successful login.
 *
 * <p>It includes both the authenticated user data and the JWT token
 * required for protected API requests.</p>
 */
export interface AuthResponse {
  /**
   * Unique identifier of the authenticated user.
   */
  id: number;

  /**
   * Email address of the authenticated user.
   */
  email: string;

  /**
   * Role assigned to the authenticated user.
   */
  role: UserRole;

  /**
   * Indicates whether the account is currently active.
   */
  active: boolean;

  /**
   * JWT token issued after successful authentication.
   */
  token: string;
}

/**
 * Response returned by the backend after a successful registration.
 */
export interface RegisterResponse {
  /**
   * Unique identifier of the created user.
   */
  id: number;

  /**
   * Email address of the created user.
   */
  email: string;

  /**
   * Role assigned to the created user.
   */
  role: UserRole;

  /**
   * Indicates whether the account is active.
   */
  active: boolean;
}