"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AuthResponse } from "@/types/auth";
import Image from "next/image";

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

    const isFormFilled = email.trim() !== "" && password.trim() !== "";

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        setError("");
        setFieldErrors({});

        const errors: Record<string, string> = {};

        if (!email.trim()) errors.email = "Introduce tu correo.";
        if (!password.trim()) errors.password = "Introduce tu contraseña.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch<AuthResponse>(
                "/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                },
                false
            );

            saveSession(response);

            if (response.role === "STUDENT") router.push("/student/dashboard");
            else if (response.role === "PROFESSOR") router.push("/professor/dashboard");
            else if (response.role === "ADMIN") router.push("/admin/dashboard");
            else router.push("/dashboard");
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
                setError("No se ha podido iniciar sesión.");
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
                        width={90}
                        height={90}
                        className="rounded-2xl shadow-md"
                        priority
                    />
                </div>

                <div className="mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                        Acceso a la plataforma
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        Iniciar sesión
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Introduce tus credenciales para acceder a tu panel según tu rol.
                    </p>
                </div>

                {resetSuccess === "true" && (
                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        La contraseña se ha actualizado correctamente. Ya puedes iniciar sesión.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="Introduce tu correo electrónico"
                            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.email
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200"
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
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {fieldErrors.email}
                            </p>
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
                                className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${fieldErrors.password
                                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-200"
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                                aria-label={
                                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                                }
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>

                        {fieldErrors.password && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {fieldErrors.password}
                            </p>
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
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <Link
                        href="/forgot-password"
                        className="block text-center text-sm font-medium text-slate-500 transition hover:text-blue-700"
                    >
                        ¿Has olvidado tu contraseña?
                    </Link>
                </form>
            </section>
        </main>
    );
}