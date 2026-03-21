import { API_BASE_URL } from "@/lib/constants";
import { getToken } from "@/lib/auth";

function isJsonLike(contentType: string | null) {
    return !!contentType && (
        contentType.includes("application/json") ||
        contentType.includes("application/problem+json")
    );
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
): Promise<T> {
    const token = includeAuth ? getToken() : null;

    const headers = new Headers(options.headers || {});
    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message = `Error ${response.status}`;

        try {
            const contentType = response.headers.get("content-type");

            if (isJsonLike(contentType)) {
                const data = await response.json();

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
            // dejamos el mensaje por defecto
        }

        throw new Error(message);
    }

    const contentType = response.headers.get("content-type");

    if (isJsonLike(contentType)) {
        return response.json() as Promise<T>;
    }

    return {} as T;
}