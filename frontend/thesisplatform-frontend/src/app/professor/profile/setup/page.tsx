"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";

export default function ProfessorProfileSetupPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);
    const [researchLines, setResearchLines] = useState<ResearchLine[]>([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [availableToSupervise, setAvailableToSupervise] = useState(true);
    const [maxPhdStudents, setMaxPhdStudents] = useState("");
    const [additionalInformation, setAdditionalInformation] = useState("");
    const [selectedDoctoralPrograms, setSelectedDoctoralPrograms] = useState<number[]>([]);
    const [selectedResearchLines, setSelectedResearchLines] = useState<number[]>([]);

    useEffect(() => {
        async function init() {
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
                const [programs, lines] = await Promise.all([
                    apiFetch<DoctoralProgram[]>("/catalog/doctoral-programs"),
                    apiFetch<ResearchLine[]>("/catalog/research-lines"),
                ]);

                setDoctoralPrograms(programs);
                setResearchLines(lines);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("No se han podido cargar los catálogos");
                }
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [router]);

    function toggleId(id: number, values: number[], setter: (v: number[]) => void) {
        if (values.includes(id)) {
            setter(values.filter((item) => item !== id));
        } else {
            setter([...values, id]);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        setSaving(true);

        const errors: Record<string, string> = {};

        if (!firstName.trim()) errors.firstName = "Introduce el nombre.";
        if (!lastName.trim()) errors.lastName = "Introduce los apellidos.";
        if (!institution.trim()) errors.institution = "Introduce la institución.";

        if (selectedDoctoralPrograms.length === 0) {
            errors.doctoralProgramIds = "Selecciona al menos un programa de doctorado.";
        }

        if (selectedResearchLines.length === 0) {
            errors.researchLineIds = "Selecciona al menos una línea de investigación.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setSaving(false);
            return;
        }

        try {
            await apiFetch("/professors/me", {
                method: "PUT",
                body: JSON.stringify({
                    firstName,
                    lastName,
                    institution,
                    department: department || null,
                    availableToSupervise,
                    maxPhdStudents: maxPhdStudents ? Number(maxPhdStudents) : null,
                    additionalInformation: additionalInformation || null,
                    cvUrl: "pending-upload",
                    doctoralProgramIds: selectedDoctoralPrograms,
                    researchLineIds: selectedResearchLines,
                }),
            });

            router.push("/?success=registered");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se ha podido guardar el perfil");
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
                <p>Cargando formulario...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">Registro de profesor</p>
                    <h1 className="text-3xl font-bold">Completa tu perfil</h1>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Nombre</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.firstName ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                if (fieldErrors.firstName) {
                                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                                }
                            }}
                        />
                        {fieldErrors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Apellidos</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.lastName ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                                if (fieldErrors.lastName) {
                                    setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                                }
                            }}
                        />
                        {fieldErrors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Institución</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.institution ? "border-red-500 bg-red-50" : ""
                                }`}
                            value={institution}
                            onChange={(e) => {
                                setInstitution(e.target.value);
                                if (fieldErrors.institution) {
                                    setFieldErrors((prev) => ({ ...prev, institution: "" }));
                                }
                            }}
                        />
                        {fieldErrors.institution && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.institution}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Departamento</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">¿Disponible para dirigir?</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={availableToSupervise ? "yes" : "no"}
                            onChange={(e) => setAvailableToSupervise(e.target.value === "yes")}
                        >
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Máx. doctorandos</label>
                        <input
                            type="number"
                            className="w-full rounded-xl border px-3 py-2"
                            value={maxPhdStudents}
                            onChange={(e) => setMaxPhdStudents(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Información adicional</label>
                        <textarea
                            className="w-full rounded-xl border px-3 py-2"
                            rows={4}
                            value={additionalInformation}
                            onChange={(e) => setAdditionalInformation(e.target.value)}
                        />
                    </div>
                </div>

                <div className={`rounded-xl p-3 ${fieldErrors.doctoralProgramIds ? "border border-red-500 bg-red-50" : ""}`}>
                    <p className="mb-2 text-sm font-medium">Programas de doctorado</p>

                    {doctoralPrograms.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay programas de doctorado disponibles todavía.
                        </p>
                    ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                            {doctoralPrograms.map((program) => (
                                <label key={program.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedDoctoralPrograms.includes(program.id)}
                                        onChange={() => {
                                            toggleId(program.id, selectedDoctoralPrograms, setSelectedDoctoralPrograms);
                                            if (fieldErrors.doctoralProgramIds) {
                                                setFieldErrors((prev) => ({ ...prev, doctoralProgramIds: "" }));
                                            }
                                        }}
                                    />
                                    <span>{program.name}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {fieldErrors.doctoralProgramIds && (
                        <p className="mt-2 text-sm text-red-600">{fieldErrors.doctoralProgramIds}</p>
                    )}
                </div>

                <div className={`rounded-xl p-3 ${fieldErrors.researchLineIds ? "border border-red-500 bg-red-50" : ""}`}>
                    <p className="mb-2 text-sm font-medium">Líneas de investigación</p>

                    {researchLines.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay líneas de investigación disponibles todavía.
                        </p>
                    ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                            {researchLines.map((line) => (
                                <label key={line.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedResearchLines.includes(line.id)}
                                        onChange={() => {
                                            toggleId(line.id, selectedResearchLines, setSelectedResearchLines);
                                            if (fieldErrors.researchLineIds) {
                                                setFieldErrors((prev) => ({ ...prev, researchLineIds: "" }));
                                            }
                                        }}
                                    />
                                    <span>{line.name}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {fieldErrors.researchLineIds && (
                        <p className="mt-2 text-sm text-red-600">{fieldErrors.researchLineIds}</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        Volver al inicio
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        {saving ? "Guardando..." : "Guardar perfil"}
                    </button>
                </div>
            </form>
        </main>
    );
}