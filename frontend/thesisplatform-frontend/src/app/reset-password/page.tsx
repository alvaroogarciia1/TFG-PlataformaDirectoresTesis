"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        setLoading(true);

        const errors: Record<string, string> = {};

        if (!token) {
            errors.token = "El enlace de recuperación no es válido.";
        }

        if (!newPassword.trim()) {
            errors.newPassword = "Introduce una nueva contraseña.";
        }

        if (!confirmPassword.trim()) {
            errors.confirmPassword = "Confirma la nueva contraseña.";
        }

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            errors.confirmPassword = "Las contraseñas no coinciden.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }

        try {
            await apiFetch(
                "/auth/reset-password",
                {
                    method: "POST",
                    body: JSON.stringify({
                        token,
                        newPassword,
                    }),
                },
                false
            );

            router.push("/login?resetSuccess=true");
        } catch (err) {
            if (err instanceof Error) {
                if (
                    err.message.includes("size must be between") ||
                    err.message.includes("must be at least 6 characters")
                ) {
                    setError("La contraseña debe tener entre 6 y 100 caracteres.");
                } else if (
                    err.message.includes("Invalid token") ||
                    err.message.includes("Token expired") ||
                    err.message.includes("Token already used")
                ) {
                    setError("El enlace no es válido, ha caducado o ya ha sido utilizado.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("No se ha podido restablecer la contraseña.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
            <div className="w-full rounded-2xl border p-6 shadow-sm">
                <Link
                    href="/login"
                    className="mb-4 inline-block text-sm text-gray-500 transition hover:text-gray-800"
                >
                    ← Volver al inicio de sesión
                </Link>

                <h1 className="mb-2 text-2xl font-semibold">Nueva contraseña</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Introduce tu nueva contraseña para restablecer el acceso.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fieldErrors.token && (
                        <p className="text-sm text-red-600">{fieldErrors.token}</p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            className={`w-full rounded-xl border px-3 py-2 outline-none ${fieldErrors.newPassword ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (fieldErrors.newPassword) {
                                    setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
                                }
                                if (fieldErrors.confirmPassword) {
                                    setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                }
                            }}
                        />
                        {fieldErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.newPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            type="password"
                            className={`w-full rounded-xl border px-3 py-2 outline-none ${fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (fieldErrors.confirmPassword) {
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: "",
                                    }));
                                }
                            }}
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : "Guardar nueva contraseña"}
                    </button>
                </form>
            </div>
        </main>
    );
}