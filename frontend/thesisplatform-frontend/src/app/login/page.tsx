"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AuthResponse } from "@/types/auth";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const resetSuccess = searchParams.get("resetSuccess");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        setLoading(true);

        const errors: Record<string, string> = {};

        if (!email.trim()) {
            errors.email = "Introduce tu correo.";
        }

        if (!password.trim()) {
            errors.password = "Introduce tu contraseña.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }

        try {
            const response = await apiFetch<AuthResponse>(
                "/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                },
                false
            );

            saveSession(response);

            if (response.role === "STUDENT") {
                router.push("/student/dashboard");
                return;
            }

            if (response.role === "PROFESSOR") {
                router.push("/professor/dashboard");
                return;
            }

            if (response.role === "ADMIN") {
                router.push("/admin/dashboard");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("Invalid credentials")) {
                    setError("Correo o contraseña incorrectos.");
                } else if (err.message.includes("deactivated")) {
                    setError("Tu cuenta está desactivada.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("No se ha podido iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
            <div className="w-full rounded-2xl border p-6 shadow-sm">
                <Link
                    href="/"
                    className="mb-4 inline-block text-sm text-gray-500 transition hover:text-gray-800"
                >
                    ← Volver al inicio
                </Link>

                <h1 className="mb-2 text-2xl font-semibold">Iniciar sesión</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Accede a la plataforma con tu cuenta.
                </p>

                {resetSuccess === "true" && (
                    <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                        La contraseña se ha actualizado correctamente. Ya puedes iniciar sesión.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Correo</label>
                        <input
                            type="email"
                            className={`w-full rounded-xl border px-3 py-2 outline-none ${fieldErrors.email ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) {
                                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                                }
                            }}
                        />
                        {fieldErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`w-full rounded-xl border px-3 py-2 pr-11 outline-none ${fieldErrors.password ? "border-red-500 bg-red-50" : ""
                                    }`}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) {
                                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-800"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:opacity-60"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <Link
                        href="/forgot-password"
                        className="block text-center text-sm text-gray-500 transition hover:text-gray-800"
                    >
                        ¿Has olvidado tu contraseña?
                    </Link>
                </form>
            </div>
        </main>
    );
}