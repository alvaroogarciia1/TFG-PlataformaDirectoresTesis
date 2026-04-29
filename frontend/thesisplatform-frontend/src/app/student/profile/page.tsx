"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout, clearSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Builds the public URL used to access a CV file.
 *
 * @param cvUrl - Absolute URL or relative file path returned by the backend.
 * @returns Full URL that can be opened from the browser.
 */
function buildCvUrl(cvUrl: string) {
    if (cvUrl.startsWith("http")) {
        return cvUrl;
    }

    return `${FILE_BASE_URL}/files/${cvUrl}`;
}

/**
 * Student profile page.
 *
 * Displays the current student's academic profile, including personal data,
 * thesis proposal information, funding details, doctoral programs, research
 * lines and uploaded CV.
 */
export default function StudentProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * Loads the student profile from the backend.
     *
     * The page is protected so only authenticated student users can access it.
     * Missing profiles are redirected to the setup page.
     */
    useEffect(() => {
        async function loadProfile() {
            if (!isAuthenticated()) {
                router.replace("/login");
                return;
            }

            const user = getUser();
            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.role !== "STUDENT") {
                router.replace("/dashboard");
                return;
            }

            try {
                const data = await apiFetch("/students/me");
                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("Student profile not found")) {
                        router.replace("/student/profile/setup");
                        return;
                    }

                    if (err.message.includes("Forbidden") || err.message.includes("Error 403")) {
                        clearSession();
                        router.replace("/login");
                        return;
                    }

                    setError(err.message);
                } else {
                    setError("No se ha podido cargar el perfil");
                }
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/70">
                    Cargando perfil...
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Image
                        src="/thesismatch-logo.jpeg"
                        alt="Logo ThesisMatch"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                            Área de estudiante
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                            Modificar perfil
                        </h1>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                >
                    Cerrar sesión
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {profile && (
                <div className="space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">
                    <div className="space-y-2">
                        <p><strong>Nombre:</strong> {profile.firstName}</p>
                        <p><strong>Apellidos:</strong> {profile.lastName}</p>
                        <p><strong>Institución de origen:</strong> {profile.originInstitution}</p>
                        <p><strong>Título propuesto:</strong> {profile.proposedThesisTitle}</p>
                        <p><strong>Motivación:</strong> {profile.motivation}</p>

                        <div>
                            <strong>CV:</strong>{" "}
                            {profile.cvUrl ? (
                                <div className="mt-2 flex gap-4">
                                    <a
                                        href={buildCvUrl(profile.cvUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        Ver CV
                                    </a>
                                </div>
                            ) : (
                                "No disponible"
                            )}
                        </div>

                        <p>
                            <strong>Tipo de dedicación:</strong>{" "}
                            {profile.dedicationType === "FULL_TIME" ? "Tiempo completo" : "Tiempo parcial"}
                        </p>
                        <p><strong>Financiación:</strong> {profile.hasFunding ? "Sí" : "No"}</p>
                        <p><strong>Tipo de financiación:</strong> {profile.fundingType || "-"}</p>
                        <p><strong>Duración financiación:</strong> {profile.fundingDurationMonths ?? "-"}</p>
                        <p><strong>Traslado a Madrid:</strong> {profile.willingToRelocateToMadrid ? "Sí" : "No"}</p>
                        <p><strong>Información adicional:</strong> {profile.additionalInformation || "-"}</p>

                        <div>
                            <strong>Programas de doctorado:</strong>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(profile.doctoralPrograms || []).map((program: string) => (
                                    <span
                                        key={program}
                                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                    >
                                        {program}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <strong>Líneas de investigación:</strong>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(profile.researchLines || []).map((line: string) => (
                                    <span
                                        key={line}
                                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                    >
                                        {line}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/student/dashboard")}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Volver
                        </button>

                        <button
                            onClick={() => router.push("/student/profile/setup")}
                            className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                        >
                            Editar perfil
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}