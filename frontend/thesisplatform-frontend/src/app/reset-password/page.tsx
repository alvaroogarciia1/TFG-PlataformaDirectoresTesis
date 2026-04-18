"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const isFormFilled =
        password.trim() !== "" &&
        confirmPassword.trim() !== "";

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!isFormFilled) {
            return;
        }

        setError("");
        setFieldErrors({});
        setLoading(true);

        const errors: Record<string, string> = {};

        if (!password.trim()) {
            errors.password = "Introduce una contraseña.";
        }

        if (!confirmPassword.trim()) {
            errors.confirmPassword = "Confirma la contraseña.";
        }

        if (password && confirmPassword && password !== confirmPassword) {
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
                        newPassword: password,
                    }),
                },
                false
            );

            router.push("/login?resetSuccess=true");
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("Invalid token")) {
                    setError("El enlace no es válido o ha expirado.");
                } else if (
                    err.message.includes("must be at least 6 characters") ||
                    err.message.includes("size must be between") ||
                    err.message.includes("el tamaño debe estar entre")
                ) {
                    setError("La contraseña debe tener entre 6 y 100 caracteres.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("No se ha podido restablecer la contraseña");
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

                <h1 className="mb-2 text-2xl font-semibold">Restablecer contraseña</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Introduce tu nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Nueva contraseña
                        </label>
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
                                    if (fieldErrors.confirmPassword) {
                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            confirmPassword: "",
                                        }));
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

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`w-full rounded-xl border px-3 py-2 pr-11 outline-none ${fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : ""
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
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-800"
                                aria-label={
                                    showConfirmPassword
                                        ? "Ocultar confirmación de contraseña"
                                        : "Mostrar confirmación de contraseña"
                                }
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {confirmPassword.trim() !== "" && password !== confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                Las contraseñas no coinciden.
                            </p>
                        )}

                        {fieldErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !isFormFilled}
                        className="w-full rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Actualizando..." : "Actualizar contraseña"}
                    </button>
                </form>
            </div>
        </main>
    );
}