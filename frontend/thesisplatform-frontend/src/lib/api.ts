import { API_BASE_URL } from "@/lib/constants";
import { getToken } from "@/lib/auth";

/**
 * Checks whether the received content type should be treated as JSON.
 *
 * <p>This helper accepts both regular JSON responses and Problem Details
 * responses returned by the backend for error handling.</p>
 *
 * @param contentType HTTP response content type header
 * @returns true when the response body should be parsed as JSON
 */
function isJsonLike(contentType: string | null) {
    return !!contentType && (
        contentType.includes("application/json") ||
        contentType.includes("application/problem+json")
    );
}

/**
 * Generic helper for performing HTTP requests against the backend API.
 *
 * <p>This function centralizes:
 * <ul>
 *   <li>base URL concatenation,</li>
 *   <li>automatic authorization header injection,</li>
 *   <li>JSON content-type handling,</li>
 *   <li>backend error parsing,</li>
 *   <li>typed response deserialization.</li>
 * </ul>
 *
 * It is the main low-level utility used by the rest of the frontend
 * service modules.</p>
 *
 * @typeParam T expected response type
 * @param endpoint backend endpoint relative to the API base URL
 * @param options fetch configuration options
 * @param includeAuth whether the bearer token should be included automatically
 * @returns parsed response body typed as T
 * @throws Error when the backend responds with a non-success status
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
): Promise<T> {
    const token = includeAuth ? getToken() : null;

    const headers = new Headers(options.headers || {});
    const isFormData = options.body instanceof FormData;

    // JSON content type is only set when the body is not multipart form data.
    if (!isFormData) {
        headers.set("Content-Type", "application/json");
    }

    // Add JWT token when the request requires authentication and a token exists.
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Normalize backend errors into readable frontend exceptions.
    if (!response.ok) {
        let message = `Error ${response.status}`;

        try {
            const contentType = response.headers.get("content-type");

            if (isJsonLike(contentType)) {
                const data = await response.json();

                // Validation errors returned by the backend are prioritized.
                if (data.errors && typeof data.errors === "object") {
                    const values = Object.values(data.errors);
                    const firstError = values[0];

                    if (typeof firstError === "string" && firstError.trim()) {
                        message = firstError;
                    } else {
                        message = "Hay campos no válidos";
                    }
                } else if (typeof data.detail === "string" && data.detail.trim()) {
                    message = data.detail;
                } else if (typeof data.message === "string" && data.message.trim()) {
                    message = data.message;
                } else if (typeof data.title === "string" && data.title.trim()) {
                    message = data.title;
                } else if (typeof data.error === "string" && data.error.trim()) {
                    message = data.error;
                } else {
                    message = "Ha ocurrido un error en la petición";
                }
            } else {
                const text = await response.text();
                if (text) message = text;
            }
        } catch {
            // If parsing fails, the default error message is preserved.
        }

        throw new Error(message);
    }

    const contentType = response.headers.get("content-type");

    if (isJsonLike(contentType)) {
        return response.json() as Promise<T>;
    }

    // For endpoints with no JSON response body, return an empty object casted to T.
    return {} as T;
}