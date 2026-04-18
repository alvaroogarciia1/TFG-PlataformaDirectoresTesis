"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DoctoralProgram } from "@/types/catalog";

type ProfessorProfileResponse = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    institution: string;
    department: string | null;
    availableToSupervise: boolean;
    maxPhdStudents: number | null;
    additionalInformation: string | null;
    cvUrl: string | null;
    doctoralPrograms: string[];
    researchLines: string[];
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function ProfessorProfileSetupPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [availableToSupervise, setAvailableToSupervise] = useState(true);
    const [maxPhdStudents, setMaxPhdStudents] = useState("");
    const [additionalInformation, setAdditionalInformation] = useState("");

    const [selectedDoctoralPrograms, setSelectedDoctoralPrograms] = useState<number[]>([]);

    const [researchInput, setResearchInput] = useState("");
    const [researchKeywords, setResearchKeywords] = useState<string[]>([]);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [existingCvUrl, setExistingCvUrl] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

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
                const programs = await apiFetch<DoctoralProgram[]>("/catalog/doctoral-programs");
                setDoctoralPrograms(programs);

                try {
                    const profile = await apiFetch<ProfessorProfileResponse>("/professors/me");

                    setIsEditMode(true);
                    setFirstName(profile.firstName ?? "");
                    setLastName(profile.lastName ?? "");
                    setInstitution(profile.institution ?? "");
                    setDepartment(profile.department ?? "");
                    setAvailableToSupervise(profile.availableToSupervise ?? true);
                    setMaxPhdStudents(
                        profile.maxPhdStudents != null ? String(profile.maxPhdStudents) : ""
                    );
                    setAdditionalInformation(profile.additionalInformation ?? "");
                    setExistingCvUrl(profile.cvUrl ?? "");
                    setResearchKeywords(profile.researchLines ?? []);

                    const selectedProgramIds = programs
                        .filter((program) => profile.doctoralPrograms?.includes(program.name))
                        .map((program) => program.id);

                    setSelectedDoctoralPrograms(selectedProgramIds);
                } catch {
                    // si no existe perfil todavía, se queda en modo creación
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("No se han podido cargar los datos.");
                }
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [router]);

    const isFormFilled = useMemo(() => {
        const baseFieldsFilled =
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            institution.trim() !== "" &&
            selectedDoctoralPrograms.length > 0 &&
            researchKeywords.length > 0;

        const supervisionFieldsFilled = availableToSupervise
            ? maxPhdStudents.trim() !== ""
            : true;

        const cvFilled = isEditMode ? existingCvUrl !== "" || cvFile !== null : cvFile !== null;

        return baseFieldsFilled && supervisionFieldsFilled && cvFilled;
    }, [
        firstName,
        lastName,
        institution,
        selectedDoctoralPrograms,
        researchKeywords,
        availableToSupervise,
        maxPhdStudents,
        isEditMode,
        existingCvUrl,
        cvFile,
    ]);

    function toggleId(id: number) {
        setSelectedDoctoralPrograms((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );

        if (fieldErrors.doctoralProgramIds) {
            setFieldErrors((prev) => ({ ...prev, doctoralProgramIds: "" }));
        }
    }

    function normalizeKeyword(value: string) {
        return value.trim().replace(/\s+/g, " ");
    }

    function addKeyword() {
        const value = normalizeKeyword(researchInput);
        if (!value) return;

        const alreadyExists = researchKeywords.some(
            (keyword) => keyword.toLowerCase() === value.toLowerCase()
        );

        if (!alreadyExists) {
            setResearchKeywords((prev) => [...prev, value]);
        }

        setResearchInput("");

        if (fieldErrors.researchLines) {
            setFieldErrors((prev) => ({ ...prev, researchLines: "" }));
        }
    }

    function removeKeyword(keywordToRemove: string) {
        setResearchKeywords((prev) =>
            prev.filter((keyword) => keyword !== keywordToRemove)
        );
    }

    function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        }
    }

    function validateCv(file: File | null) {
        if (!file) {
            setCvFile(null);
            setFieldErrors((prev) => ({ ...prev, cv: "" }));
            return;
        }

        if (file.type !== "application/pdf") {
            setCvFile(null);
            setFieldErrors((prev) => ({
                ...prev,
                cv: "Solo se permiten archivos PDF.",
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setCvFile(null);
            setFieldErrors((prev) => ({
                ...prev,
                cv: "El archivo no puede superar 5 MB.",
            }));
            return;
        }

        setCvFile(file);
        setFieldErrors((prev) => ({ ...prev, cv: "" }));
    }

    async function uploadProfessorCv(file: File) {
        const token = getToken();
        if (!token) {
            throw new Error("No hay sesión activa.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/professors/me/cv`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            let message = "No se ha podido subir el CV.";
            try {
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    const data = await response.json();
                    message = data.detail || data.message || data.title || message;
                } else {
                    const text = await response.text();
                    if (text) message = text;
                }
            } catch { }
            throw new Error(message);
        }

        return response.text();
    }

    async function createProfileWithCv() {
        const token = getToken();
        if (!token) {
            throw new Error("No hay sesión activa.");
        }

        if (!cvFile) {
            throw new Error("Debes adjuntar un CV en PDF.");
        }

        const formData = new FormData();

        formData.append(
            "data",
            new Blob(
                [
                    JSON.stringify({
                        firstName,
                        lastName,
                        institution,
                        department: department || null,
                        availableToSupervise,
                        maxPhdStudents: availableToSupervise ? Number(maxPhdStudents) : null,
                        additionalInformation: additionalInformation || null,
                        doctoralProgramIds: selectedDoctoralPrograms,
                        researchLines: researchKeywords,
                    }),
                ],
                { type: "application/json" }
            )
        );

        formData.append("file", cvFile);

        const response = await fetch(`${API_BASE_URL}/professors/me/setup`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            let message = "No se ha podido completar el registro del perfil.";
            try {
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    const data = await response.json();
                    message = data.detail || data.message || data.title || message;
                } else {
                    const text = await response.text();
                    if (text) message = text;
                }
            } catch { }
            throw new Error(message);
        }
    }

    async function updateProfileAndOptionalCv() {
        const cvUrlToKeep = existingCvUrl || null;

        await apiFetch("/professors/me", {
            method: "PUT",
            body: JSON.stringify({
                firstName,
                lastName,
                institution,
                department: department || null,
                availableToSupervise,
                maxPhdStudents: availableToSupervise ? Number(maxPhdStudents) : null,
                additionalInformation: additionalInformation || null,
                cvUrl: cvUrlToKeep,
                doctoralProgramIds: selectedDoctoralPrograms,
                researchLines: researchKeywords,
            }),
        });

        if (cvFile) {
            const newCvUrl = await uploadProfessorCv(cvFile);
            setExistingCvUrl(newCvUrl);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!isFormFilled) {
            return;
        }

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
        if (researchKeywords.length === 0) {
            errors.researchLines = "Añade al menos una línea de investigación.";
        }
        if (availableToSupervise && !maxPhdStudents.trim()) {
            errors.maxPhdStudents = "Introduce el número máximo de doctorandos.";
        }
        if (!isEditMode && !cvFile) {
            errors.cv = "Debes adjuntar un CV en PDF.";
        }
        if (isEditMode && !existingCvUrl && !cvFile) {
            errors.cv = "Debes adjuntar un CV en PDF.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setSaving(false);
            return;
        }

        try {
            if (isEditMode) {
                await updateProfileAndOptionalCv();
                router.push("/professor/profile");
            } else {
                await createProfileWithCv();
                router.push("/?success=registered");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se ha podido guardar el perfil.");
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
            <div className="mb-8">
                <p className="text-sm text-gray-500">
                    {isEditMode ? "Editar perfil de profesor" : "Registro de profesor"}
                </p>
                <h1 className="text-3xl font-bold">
                    {isEditMode ? "Modifica tu perfil" : "Completa tu perfil"}
                </h1>
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
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.firstName ? "border-red-500 bg-red-50" : ""}`}
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
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.lastName ? "border-red-500 bg-red-50" : ""}`}
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

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Institución</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.institution ? "border-red-500 bg-red-50" : ""}`}
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

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Departamento</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">¿Disponible para dirigir tesis?</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={availableToSupervise ? "yes" : "no"}
                            onChange={(e) => {
                                const value = e.target.value === "yes";
                                setAvailableToSupervise(value);
                                if (!value) {
                                    setMaxPhdStudents("");
                                    setFieldErrors((prev) => ({ ...prev, maxPhdStudents: "" }));
                                }
                            }}
                        >
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    {availableToSupervise && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Nº máximo de doctorandos</label>
                            <input
                                type="number"
                                min="1"
                                className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.maxPhdStudents ? "border-red-500 bg-red-50" : ""}`}
                                value={maxPhdStudents}
                                onChange={(e) => {
                                    setMaxPhdStudents(e.target.value);
                                    if (fieldErrors.maxPhdStudents) {
                                        setFieldErrors((prev) => ({ ...prev, maxPhdStudents: "" }));
                                    }
                                }}
                            />
                            {fieldErrors.maxPhdStudents && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.maxPhdStudents}</p>
                            )}
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Programas de doctorado</label>

                        <div className="space-y-2 rounded-xl border p-3">
                            {doctoralPrograms.length === 0 ? (
                                <p className="text-sm text-gray-500">Cargando programas...</p>
                            ) : (
                                doctoralPrograms.map((program) => (
                                    <label key={program.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedDoctoralPrograms.includes(program.id)}
                                            onChange={() => toggleId(program.id)}
                                        />
                                        <span>{program.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        {fieldErrors.doctoralProgramIds && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.doctoralProgramIds}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">
                            Líneas de investigación
                        </label>

                        <div className="flex gap-2">
                            <input
                                className="flex-1 rounded-xl border px-3 py-2"
                                value={researchInput}
                                onChange={(e) => setResearchInput(e.target.value)}
                                onKeyDown={handleKeywordKeyDown}
                                placeholder="Escribe una línea y pulsa Enter"
                            />
                            <button
                                type="button"
                                onClick={addKeyword}
                                className="rounded-xl border px-4 py-2"
                            >
                                Añadir
                            </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {researchKeywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                                >
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => removeKeyword(keyword)}
                                        className="text-gray-500 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        {fieldErrors.researchLines && (
                            <p className="mt-2 text-sm text-red-600">{fieldErrors.researchLines}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Información adicional</label>
                        <textarea
                            className="w-full rounded-xl border px-3 py-2"
                            rows={3}
                            value={additionalInformation}
                            onChange={(e) => setAdditionalInformation(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Adjuntar CV (PDF)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.cv ? "border-red-500 bg-red-50" : ""}`}
                            onChange={(e) => validateCv(e.target.files?.[0] ?? null)}
                        />
                        {existingCvUrl && !cvFile && (
                            <p className="mt-1 text-sm text-gray-600">
                                Ya hay un CV subido para este perfil.
                            </p>
                        )}
                        {fieldErrors.cv && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.cv}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push(isEditMode ? "/professor/profile" : "/")}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        {isEditMode ? "Volver" : "Volver al inicio"}
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !isFormFilled}
                        className="rounded-xl border px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar perfil"}
                    </button>
                </div>
            </form>
        </main>
    );
}