"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DoctoralProgram } from "@/types/catalog";

type DedicationType = "FULL_TIME" | "PART_TIME";

type StudentProfileResponse = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    originInstitution: string;
    motivation: string;
    proposedThesisTitle: string;
    hasFunding: boolean;
    fundingType: string | null;
    fundingDurationMonths: number | null;
    willingToRelocateToMadrid: boolean;
    dedicationType: DedicationType;
    additionalInformation: string | null;
    cvUrl: string | null;
    doctoralPrograms: string[];
    researchLines: string[];
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function StudentProfileSetupPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [originInstitution, setOriginInstitution] = useState("");
    const [motivation, setMotivation] = useState("");
    const [proposedThesisTitle, setProposedThesisTitle] = useState("");
    const [hasFunding, setHasFunding] = useState(false);
    const [fundingType, setFundingType] = useState("");
    const [fundingDurationMonths, setFundingDurationMonths] = useState("");
    const [willingToRelocateToMadrid, setWillingToRelocateToMadrid] = useState(false);
    const [dedicationType, setDedicationType] = useState<DedicationType>("FULL_TIME");
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

            if (user.role !== "STUDENT") {
                router.replace("/dashboard");
                return;
            }

            try {
                const programs = await apiFetch<DoctoralProgram[]>("/catalog/doctoral-programs");
                setDoctoralPrograms(programs);

                try {
                    const profile = await apiFetch<StudentProfileResponse>("/students/me");

                    setIsEditMode(true);
                    setFirstName(profile.firstName ?? "");
                    setLastName(profile.lastName ?? "");
                    setOriginInstitution(profile.originInstitution ?? "");
                    setMotivation(profile.motivation ?? "");
                    setProposedThesisTitle(profile.proposedThesisTitle ?? "");
                    setHasFunding(profile.hasFunding ?? false);
                    setFundingType(profile.fundingType ?? "");
                    setFundingDurationMonths(
                        profile.fundingDurationMonths != null
                            ? String(profile.fundingDurationMonths)
                            : ""
                    );
                    setWillingToRelocateToMadrid(profile.willingToRelocateToMadrid ?? false);
                    setDedicationType(profile.dedicationType ?? "FULL_TIME");
                    setAdditionalInformation(profile.additionalInformation ?? "");
                    setExistingCvUrl(profile.cvUrl ?? "");
                    setResearchKeywords(profile.researchLines ?? []);

                    const selectedProgramIds = programs
                        .filter((program) => profile.doctoralPrograms?.includes(program.name))
                        .map((program) => program.id);

                    setSelectedDoctoralPrograms(selectedProgramIds);
                } catch {
                    // modo registro
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

    function toggleId(id: number, values: number[], setter: (v: number[]) => void) {
        if (values.includes(id)) {
            setter(values.filter((item) => item !== id));
        } else {
            setter([...values, id]);
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
            setResearchKeywords([...researchKeywords, value]);
        }

        setResearchInput("");
        if (fieldErrors.researchLines) {
            setFieldErrors((prev) => ({ ...prev, researchLines: "" }));
        }
    }

    function removeKeyword(keywordToRemove: string) {
        setResearchKeywords(
            researchKeywords.filter((keyword) => keyword !== keywordToRemove)
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

    async function uploadStudentCv(file: File) {
        const token = getToken();
        if (!token) {
            throw new Error("No hay sesión activa.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/students/me/cv`, {
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
                        originInstitution,
                        motivation,
                        proposedThesisTitle,
                        hasFunding,
                        fundingType: hasFunding ? fundingType : null,
                        fundingDurationMonths: hasFunding ? Number(fundingDurationMonths) : null,
                        willingToRelocateToMadrid,
                        dedicationType,
                        additionalInformation: additionalInformation || null,
                        doctoralProgramIds: selectedDoctoralPrograms,
                        researchLines: researchKeywords,
                    }),
                ],
                { type: "application/json" }
            )
        );

        formData.append("file", cvFile);

        const response = await fetch(`${API_BASE_URL}/students/me/setup`, {
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

        await apiFetch("/students/me", {
            method: "PUT",
            body: JSON.stringify({
                firstName,
                lastName,
                originInstitution,
                motivation,
                proposedThesisTitle,
                hasFunding,
                fundingType: hasFunding ? fundingType : null,
                fundingDurationMonths: hasFunding ? Number(fundingDurationMonths) : null,
                willingToRelocateToMadrid,
                dedicationType,
                additionalInformation: additionalInformation || null,
                cvUrl: cvUrlToKeep,
                doctoralProgramIds: selectedDoctoralPrograms,
                researchLines: researchKeywords,
            }),
        });

        if (cvFile) {
            const newCvUrl = await uploadStudentCv(cvFile);
            setExistingCvUrl(newCvUrl);
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
        if (!originInstitution.trim()) errors.originInstitution = "Introduce la institución de origen.";
        if (!proposedThesisTitle.trim()) errors.proposedThesisTitle = "Introduce un título de tesis.";
        if (!motivation.trim()) errors.motivation = "Introduce la motivación.";

        if (selectedDoctoralPrograms.length === 0) {
            errors.doctoralProgramIds = "Selecciona al menos un programa de doctorado.";
        }

        if (researchKeywords.length === 0) {
            errors.researchLines = "Añade al menos una línea de investigación.";
        }

        if (hasFunding && !fundingType.trim()) {
            errors.fundingType = "Introduce el tipo de financiación.";
        }

        if (hasFunding && !fundingDurationMonths.trim()) {
            errors.fundingDurationMonths = "Introduce la duración de la financiación.";
        }

        if (!isEditMode && !cvFile) {
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
                router.push("/student/profile");
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
                    {isEditMode ? "Editar perfil de estudiante" : "Registro de estudiante"}
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
                            onChange={(e) => setFirstName(e.target.value)}
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
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        {fieldErrors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Institución de origen</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.originInstitution ? "border-red-500 bg-red-50" : ""}`}
                            value={originInstitution}
                            onChange={(e) => setOriginInstitution(e.target.value)}
                        />
                        {fieldErrors.originInstitution && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.originInstitution}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Título propuesto de tesis</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.proposedThesisTitle ? "border-red-500 bg-red-50" : ""}`}
                            value={proposedThesisTitle}
                            onChange={(e) => setProposedThesisTitle(e.target.value)}
                        />
                        {fieldErrors.proposedThesisTitle && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.proposedThesisTitle}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Motivación</label>
                        <textarea
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.motivation ? "border-red-500 bg-red-50" : ""}`}
                            rows={4}
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                        />
                        {fieldErrors.motivation && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.motivation}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Dedicación</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={dedicationType}
                            onChange={(e) => setDedicationType(e.target.value as DedicationType)}
                        >
                            <option value="FULL_TIME">Tiempo completo</option>
                            <option value="PART_TIME">Tiempo parcial</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">¿Dispones de financiación?</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={hasFunding ? "yes" : "no"}
                            onChange={(e) => {
                                const value = e.target.value === "yes";
                                setHasFunding(value);
                                if (!value) {
                                    setFundingType("");
                                    setFundingDurationMonths("");
                                }
                            }}
                        >
                            <option value="no">No</option>
                            <option value="yes">Sí</option>
                        </select>
                    </div>

                    {hasFunding && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tipo de financiación</label>
                                <input
                                    className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.fundingType ? "border-red-500 bg-red-50" : ""}`}
                                    value={fundingType}
                                    onChange={(e) => setFundingType(e.target.value)}
                                />
                                {fieldErrors.fundingType && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fundingType}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Duración financiación (meses)</label>
                                <input
                                    type="number"
                                    className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.fundingDurationMonths ? "border-red-500 bg-red-50" : ""}`}
                                    value={fundingDurationMonths}
                                    onChange={(e) => setFundingDurationMonths(e.target.value)}
                                />
                                {fieldErrors.fundingDurationMonths && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fundingDurationMonths}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">¿Dispuesto a trasladarte a Madrid?</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={willingToRelocateToMadrid ? "yes" : "no"}
                            onChange={(e) => setWillingToRelocateToMadrid(e.target.value === "yes")}
                        >
                            <option value="no">No</option>
                            <option value="yes">Sí</option>
                        </select>
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
                        <label className="mb-1 block text-sm font-medium">
                            Currículum (PDF){isEditMode ? "" : " *"}
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.cv ? "border-red-500 bg-red-50" : ""}`}
                            onChange={(e) => validateCv(e.target.files?.[0] || null)}
                        />
                        {isEditMode && existingCvUrl && (
                            <p className="mt-2 text-sm text-gray-600">
                                Ya tienes un CV subido. Si seleccionas otro archivo, se reemplazará.
                            </p>
                        )}
                        {fieldErrors.cv && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.cv}</p>
                        )}
                    </div>
                </div>

                <div className={`rounded-xl p-3 ${fieldErrors.doctoralProgramIds ? "border border-red-500 bg-red-50" : ""}`}>
                    <p className="mb-2 text-sm font-medium">Programas de doctorado</p>
                    <div className="grid gap-2 md:grid-cols-2">
                        {doctoralPrograms.map((program) => (
                            <label key={program.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={selectedDoctoralPrograms.includes(program.id)}
                                    onChange={() =>
                                        toggleId(program.id, selectedDoctoralPrograms, setSelectedDoctoralPrograms)
                                    }
                                />
                                <span>{program.name}</span>
                            </label>
                        ))}
                    </div>
                    {fieldErrors.doctoralProgramIds && (
                        <p className="mt-2 text-sm text-red-600">{fieldErrors.doctoralProgramIds}</p>
                    )}
                </div>

                <div className={`rounded-xl p-3 ${fieldErrors.researchLines ? "border border-red-500 bg-red-50" : ""}`}>
                    <p className="mb-2 text-sm font-medium">Líneas de investigación</p>

                    <div className="mb-3 flex gap-2">
                        <input
                            className="flex-1 rounded-xl border px-3 py-2"
                            value={researchInput}
                            onChange={(e) => setResearchInput(e.target.value)}
                            onKeyDown={handleKeywordKeyDown}
                            placeholder="Ej: IA, Backend, Unity..."
                        />
                        <button
                            type="button"
                            onClick={addKeyword}
                            className="rounded-xl border px-4 py-2 font-medium"
                        >
                            Añadir
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
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

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push(isEditMode ? "/student/profile" : "/")}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        {isEditMode ? "Volver" : "Volver al inicio"}
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar perfil"}
                    </button>
                </div>
            </form>
        </main>
    );
}