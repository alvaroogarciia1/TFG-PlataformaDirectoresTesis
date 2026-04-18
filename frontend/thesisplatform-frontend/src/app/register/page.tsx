"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AuthResponse, RegisterResponse, UserRole } from "@/types/auth";

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<UserRole>("STUDENT");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const isFormFilled =
        email.trim() !== "" &&
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

        if (!email.trim()) {
            errors.email = "Introduce un correo.";
        }

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
            await apiFetch<RegisterResponse>(
                "/auth/register",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password,
                        role,
                    }),
                },
                false
            );

            const loginResponse = await apiFetch<AuthResponse>(
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

            saveSession(loginResponse);

            if (loginResponse.role === "STUDENT") {
                router.push("/student/profile/setup");
                return;
            }

            if (loginResponse.role === "PROFESSOR") {
                router.push("/professor/profile/setup");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("already exists")) {
                    setError("Ya existe una cuenta registrada con ese correo.");
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
                setError("No se ha podido completar el registro");
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

                <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Regístrate como estudiante o profesor.
                </p>

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
                                    if (fieldErrors.confirmPassword) {
                                        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
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
                        {fieldErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Rol</label>
                        <select
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.role ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value as UserRole);
                                if (fieldErrors.role) {
                                    setFieldErrors((prev) => ({ ...prev, role: "" }));
                                }
                            }}
                        >
                            <option value="STUDENT">Estudiante</option>
                            <option value="PROFESSOR">Profesor</option>
                        </select>
                        {fieldErrors.role && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !isFormFilled}
                        className="w-full rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
            </div>
        </main>
    );
}