"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AuthResponse, RegisterResponse, UserRole } from "@/types/auth";
import Image from "next/image";

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
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
            <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-200/80 backdrop-blur">
                <Link
                    href="/"
                    className="mb-6 inline-flex text-sm font-medium text-slate-500 transition hover:text-blue-700"
                >
                    ← Volver al inicio
                </Link>

                <div className="mb-6 flex justify-center">
                    <Image
                        src="/thesismatch-logo.jpeg"
                        alt="Logo ThesisMatch"
                        width={150}
                        height={150}
                        className="rounded-2xl shadow-md"
                        priority
                    />
                </div>

                <div className="mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                        Nueva cuenta
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        Crear cuenta
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Regístrate como estudiante o profesor para comenzar a completar tu perfil académico.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="Introduce tu correo electrónico"
                            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.email ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
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
                            <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Introduce tu contraseña"
                                className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.password ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repite la contraseña"
                                className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.confirmPassword ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                                aria-label={
                                    showConfirmPassword
                                        ? "Ocultar confirmación de contraseña"
                                        : "Mostrar confirmación de contraseña"
                                }
                            >
                                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Rol
                        </label>
                        <select
                            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.role ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
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
                            <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.role}</p>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isFormFilled}
                        className="w-full rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
            </section>
        </main>
    );
}