"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout, clearSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import {
    getMySupervisedTheses,
    createSupervisedThesis,
    deleteSupervisedThesis,
    updateSupervisedThesis,
} from "@/lib/theses";
import type { SupervisedThesis } from "@/types/professor";

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
 * Professor profile page.
 *
 * Displays the current professor academic profile and allows the professor to
 * manage supervised theses without leaving the profile section.
 */
export default function ProfessorProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [theses, setTheses] = useState<SupervisedThesis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [thesisForm, setThesisForm] = useState({
        doctoralStudentName: "",
        thesisTitle: "",
        defenseYear: "",
        researchDescription: "",
        industrialMention: false,
        internationalMention: false,
        results: "",
        ongoing: false,
    });
    const [editingThesisId, setEditingThesisId] = useState<number | null>(null);

    /**
     * Loads the professor profile and its supervised theses.
     *
     * The page is protected so only authenticated professor users can access it.
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

            if (user.role !== "PROFESSOR") {
                router.replace("/dashboard");
                return;
            }

            try {
                const data = await apiFetch("/professors/me");
                setProfile(data);

                const loadedTheses = await getMySupervisedTheses();
                setTheses(loadedTheses);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("Professor profile not found")) {
                        router.replace("/professor/profile/setup");
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

    /**
     * Creates a new supervised thesis or updates an existing one depending on
     * whether the form is currently in edit mode.
     *
     * @param e - Form submission event.
     */
    async function handleSaveThesis(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                doctoralStudentName: thesisForm.doctoralStudentName,
                thesisTitle: thesisForm.thesisTitle,
                defenseYear: thesisForm.defenseYear ? Number(thesisForm.defenseYear) : null,
                researchDescription: thesisForm.researchDescription,
                industrialMention: thesisForm.industrialMention,
                internationalMention: thesisForm.internationalMention,
                results: thesisForm.results || null,
                ongoing: thesisForm.ongoing,
            };

            if (editingThesisId !== null) {
                const updated = await updateSupervisedThesis(editingThesisId, payload);

                setTheses((prev) =>
                    prev.map((thesis) => thesis.id === editingThesisId ? updated : thesis)
                );
            } else {
                const created = await createSupervisedThesis(payload);
                setTheses((prev) => [created, ...prev]);
            }

            resetThesisForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se ha podido guardar la tesis");
        }
    }

    /**
     * Resets the supervised thesis form and exits edit mode.
     */
    function resetThesisForm() {
        setThesisForm({
            doctoralStudentName: "",
            thesisTitle: "",
            defenseYear: "",
            researchDescription: "",
            industrialMention: false,
            internationalMention: false,
            results: "",
            ongoing: false,
        });

        setEditingThesisId(null);
    }

    /**
     * Loads a supervised thesis into the form so it can be edited.
     *
     * @param thesis - Supervised thesis selected for edition.
     */
    function handleEditThesis(thesis: SupervisedThesis) {
        setEditingThesisId(thesis.id);

        setThesisForm({
            doctoralStudentName: thesis.doctoralStudentName,
            thesisTitle: thesis.thesisTitle,
            defenseYear: thesis.defenseYear != null ? String(thesis.defenseYear) : "",
            researchDescription: thesis.researchDescription,
            industrialMention: thesis.industrialMention,
            internationalMention: thesis.internationalMention,
            results: thesis.results ?? "",
            ongoing: thesis.ongoing,
        });
    }

    /**
     * Deletes a supervised thesis and removes it from the current UI state.
     *
     * @param id - Identifier of the thesis to delete.
     */
    async function handleDeleteThesis(id: number) {
        setError("");

        try {
            await deleteSupervisedThesis(id);
            setTheses((prev) => prev.filter((thesis) => thesis.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se ha podido eliminar la tesis");
        }
    }

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
                        width={150}
                        height={150}
                        className="rounded-lg"
                    />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                            Área de profesor
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
                        <p><strong>Institución:</strong> {profile.institution}</p>
                        <p><strong>Departamento:</strong> {profile.department || "-"}</p>
                        <p><strong>Disponible para dirigir:</strong> {profile.availableToSupervise ? "Sí" : "No"}</p>
                        <p><strong>Máx. doctorandos:</strong> {profile.maxPhdStudents ?? "-"}</p>

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

                        <p><strong>Información adicional:</strong> {profile.additionalInformation || "-"}</p>

                        <div>
                            <strong>Programas de doctorado:</strong>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(profile.doctoralPrograms || []).map((program: string) => (
                                    <span key={program} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                        {program}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <strong>Líneas de investigación:</strong>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(profile.researchLines || []).map((line: string) => (
                                    <span key={line} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                        {line}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <h2 className="mb-4 text-xl font-semibold">
                            Tesis dirigidas previamente o en curso
                        </h2>

                        <form onSubmit={handleSaveThesis} className="mb-6 space-y-4">
                            <input
                                className="w-full rounded-xl border px-4 py-2"
                                placeholder="Nombre del doctorando"
                                value={thesisForm.doctoralStudentName}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, doctoralStudentName: e.target.value })
                                }
                                required
                            />

                            <input
                                className="w-full rounded-xl border px-4 py-2"
                                placeholder="Título de la tesis"
                                value={thesisForm.thesisTitle}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, thesisTitle: e.target.value })
                                }
                                required
                            />

                            <input
                                className="w-full rounded-xl border px-4 py-2"
                                type="number"
                                placeholder="Año de lectura"
                                value={thesisForm.defenseYear}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, defenseYear: e.target.value })
                                }
                            />

                            <textarea
                                className="w-full rounded-xl border px-4 py-2"
                                placeholder="Líneas de investigación / descripción de la tesis"
                                value={thesisForm.researchDescription}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, researchDescription: e.target.value })
                                }
                                required
                            />

                            <textarea
                                className="w-full rounded-xl border px-4 py-2"
                                placeholder="Resultados: papers, patentes, etc."
                                value={thesisForm.results}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, results: e.target.value })
                                }
                            />

                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={thesisForm.industrialMention}
                                        onChange={(e) =>
                                            setThesisForm({
                                                ...thesisForm,
                                                industrialMention: e.target.checked,
                                            })
                                        }
                                    />
                                    Mención industrial
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={thesisForm.internationalMention}
                                        onChange={(e) =>
                                            setThesisForm({
                                                ...thesisForm,
                                                internationalMention: e.target.checked,
                                            })
                                        }
                                    />
                                    Mención internacional
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={thesisForm.ongoing}
                                        onChange={(e) =>
                                            setThesisForm({ ...thesisForm, ongoing: e.target.checked })
                                        }
                                    />
                                    En curso
                                </label>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                                >
                                    {editingThesisId !== null ? "Guardar cambios" : "Añadir tesis"}
                                </button>

                                {editingThesisId !== null && (
                                    <button
                                        type="button"
                                        onClick={resetThesisForm}
                                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="space-y-4">
                            {theses.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No hay tesis registradas.
                                </p>
                            ) : (
                                theses.map((thesis) => (
                                    <div key={thesis.id} className="rounded-xl border p-4">
                                        <h3 className="font-semibold">{thesis.thesisTitle}</h3>
                                        <p><strong>Doctorando:</strong> {thesis.doctoralStudentName}</p>
                                        <p><strong>Año:</strong> {thesis.defenseYear ?? "No indicado"}</p>
                                        <p><strong>Investigación:</strong> {thesis.researchDescription}</p>
                                        <p><strong>Resultados:</strong> {thesis.results || "No indicados"}</p>
                                        <p>
                                            <strong>Menciones:</strong>{" "}
                                            {thesis.industrialMention ? "Industrial " : ""}
                                            {thesis.internationalMention ? "Internacional " : ""}
                                            {!thesis.industrialMention && !thesis.internationalMention
                                                ? "Sin menciones"
                                                : ""}
                                        </p>
                                        <p><strong>Estado:</strong> {thesis.ongoing ? "En curso" : "Finalizada"}</p>

                                        <div className="mt-3 flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleEditThesis(thesis)}
                                                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => handleDeleteThesis(thesis.id)}
                                                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/professor/dashboard")}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Volver
                        </button>

                        <button
                            onClick={() => router.push("/professor/profile/setup")}
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