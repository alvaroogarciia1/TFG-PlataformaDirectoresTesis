import { AuthResponse } from "@/types/auth";

/**
 * Local storage key used to persist the authentication token.
 */
const TOKEN_KEY = "token";

/**
 * Local storage key used to persist the authenticated user payload.
 */
const USER_KEY = "user";

/**
 * Persists the current authenticated session in local storage.
 *
 * This includes both the JWT token and the user information returned
 * by the backend after a successful login.
 *
 * @param auth - Authentication payload returned by the backend.
 */
export function saveSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth));
}

/**
 * Retrieves the persisted JWT token from local storage.
 *
 * When executed in a server-side rendering context, the function safely returns null.
 *
 * @returns Stored authentication token or null.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieves the persisted authenticated user data from local storage.
 *
 * If the stored value cannot be parsed correctly, null is returned.
 *
 * @returns Authenticated user payload or null.
 */
export function getUser(): AuthResponse | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

/**
 * Removes all persisted authentication data from local storage.
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Indicates whether the user is currently considered authenticated in the
 * frontend session.
 *
 * @returns True when a token exists in local storage.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Clears the current session and redirects the user to the landing page.
 *
 * A success query parameter is included so the UI can show a logout message.
 */
export function logout() {
  clearSession();
  window.location.href = "/?success=logout";
}