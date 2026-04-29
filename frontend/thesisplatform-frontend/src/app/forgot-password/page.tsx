"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

/**
 * Password recovery request page.
 *
 * Allows users to request a password reset email by providing the email address
 * associated with their account.
 */
export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const isFormFilled = email.trim() !== "";

    /**
     * Validates the email field and sends a password reset request to the backend.
     *
     * @param e - Form submission event.
     */
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
            errors.email = "Introduce tu correo.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }

        try {
            await apiFetch(
                "/auth/forgot-password",
                {
                    method: "POST",
                    body: JSON.stringify({ email }),
                },
                false
            );
            router.push("/?success=reset-sent");
        } catch (err) {
            setError("No se ha podido enviar el correo. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
            <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-200/80 backdrop-blur">
                <Link
                    href="/login"
                    className="mb-6 inline-flex text-sm font-medium text-slate-500 transition hover:text-blue-700"
                >
                    ← Volver al inicio de sesión
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
                        Recuperación de acceso
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        Recuperar contraseña
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Introduce el correo asociado a tu cuenta y te enviaremos un enlace para restablecer la contraseña.
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
                        {loading ? "Enviando..." : "Enviar enlace"}
                    </button>
                </form>
            </section>
        </main>
    );
}