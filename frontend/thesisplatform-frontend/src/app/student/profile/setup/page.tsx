"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DoctoralProgram } from "@/types/catalog";
import Image from "next/image";

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

/**
 * Student profile creation and edition page.
 *
 * Allows student users to complete or update their academic profile, including
 * doctoral programs of interest, research lines, thesis proposal information,
 * funding details, dedication type and CV upload.
 */
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

    /**
     * Initializes the page by validating the session, checking that the current
     * user is a student and loading the required catalog data.
     *
     * If a student profile already exists, the form is populated and the page
     * switches to edit mode. Otherwise, it remains in creation mode.
     */
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

    /**
     * Indicates whether all mandatory fields required to submit the profile are completed.
     */
    const isFormFilled = useMemo(() => {
        const baseFieldsFilled =
            (!isEditMode ? firstName.trim() !== "" && lastName.trim() !== "" : true) &&
            originInstitution.trim() !== "" &&
            motivation.trim() !== "" &&
            proposedThesisTitle.trim() !== "" &&
            selectedDoctoralPrograms.length > 0 &&
            researchKeywords.length > 0;

        const fundingFieldsFilled = hasFunding
            ? fundingType.trim() !== "" && fundingDurationMonths.trim() !== ""
            : true;

        const cvFilled = isEditMode ? existingCvUrl !== "" || cvFile !== null : cvFile !== null;

        return baseFieldsFilled && fundingFieldsFilled && cvFilled;
    }, [
        firstName,
        lastName,
        originInstitution,
        motivation,
        proposedThesisTitle,
        selectedDoctoralPrograms,
        researchKeywords,
        hasFunding,
        fundingType,
        fundingDurationMonths,
        isEditMode,
        existingCvUrl,
        cvFile,
    ]);

    /**
     * Adds or removes a doctoral program from the selected programs list.
     *
     * @param id - Identifier of the doctoral program to toggle.
     */
    function toggleId(id: number) {
        setSelectedDoctoralPrograms((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );

        if (fieldErrors.doctoralProgramIds) {
            setFieldErrors((prev) => ({ ...prev, doctoralProgramIds: "" }));
        }
    }

    /**
     * Normalizes a research keyword by trimming spaces and collapsing repeated whitespace.
     *
     * @param value - Raw keyword entered by the user.
     * @returns Normalized keyword.
     */
    function normalizeKeyword(value: string) {
        return value.trim().replace(/\s+/g, " ");
    }

    /**
     * Adds the current input value as a research keyword, avoiding duplicates.
     */
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

    /**
     * Removes a research keyword from the selected keyword list.
     *
     * @param keywordToRemove - Keyword that must be removed.
     */
    function removeKeyword(keywordToRemove: string) {
        setResearchKeywords((prev) =>
            prev.filter((keyword) => keyword !== keywordToRemove)
        );
    }

    /**
     * Adds a keyword when the user presses Enter or comma.
     *
     * @param e - Keyboard event triggered in the research input.
     */
    function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        }
    }

    /**
     * Validates the selected CV file before submission.
     *
     * Only PDF files up to 5 MB are accepted.
     *
     * @param file - File selected by the user.
     */
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

    /**
     * Uploads a student CV file to the backend.
     *
     * @param file - Valid PDF file to upload.
     * @returns CV URL returned by the backend.
     */
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

    /**
     * Creates the student profile together with the required CV file.
     *
     * The request is sent as multipart data because it includes both structured
     * profile information and a PDF document.
     */
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

    /**
     * Updates the student profile and uploads a new CV only if the user selected one.
     */
    async function updateProfileAndOptionalCv() {
        const cvUrlToKeep = existingCvUrl || null;

        await apiFetch("/students/me", {
            method: "PUT",
            body: JSON.stringify({
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

    /**
     * Validates the complete student profile form and persists the data.
     *
     * Depending on the current mode, it either creates a new profile with its CV
     * or updates the existing profile and optionally replaces the CV.
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
        setSaving(true);

        const errors: Record<string, string> = {};

        if (!isEditMode && !firstName.trim()) errors.firstName = "Introduce el nombre.";
        if (!isEditMode && !lastName.trim()) errors.lastName = "Introduce los apellidos.";
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
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/70">
                    Cargando formulario...
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex items-center gap-3">
                <Image
                    src="/thesismatch-logo.jpeg"
                    alt="Logo ThesisMatch"
                    width={150}
                    height={150}
                    className="rounded-lg"
                />

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                        {isEditMode ? "Editar perfil de estudiante" : "Registro de estudiante"}
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        {isEditMode ? "Modifica tu perfil" : "Completa tu perfil"}
                    </h1>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">
                <div className="grid gap-4 md:grid-cols-2">
                    {!isEditMode && (
                        <>
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
                        </>
                    )}

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Institución de origen</label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.originInstitution ? "border-red-500 bg-red-50" : ""}`}
                            value={originInstitution}
                            onChange={(e) => {
                                setOriginInstitution(e.target.value);
                                if (fieldErrors.originInstitution) {
                                    setFieldErrors((prev) => ({ ...prev, originInstitution: "" }));
                                }
                            }}
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
                            onChange={(e) => {
                                setProposedThesisTitle(e.target.value);
                                if (fieldErrors.proposedThesisTitle) {
                                    setFieldErrors((prev) => ({ ...prev, proposedThesisTitle: "" }));
                                }
                            }}
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
                            onChange={(e) => {
                                setMotivation(e.target.value);
                                if (fieldErrors.motivation) {
                                    setFieldErrors((prev) => ({ ...prev, motivation: "" }));
                                }
                            }}
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
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        fundingType: "",
                                        fundingDurationMonths: "",
                                    }));
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
                                    onChange={(e) => {
                                        setFundingType(e.target.value);
                                        if (fieldErrors.fundingType) {
                                            setFieldErrors((prev) => ({ ...prev, fundingType: "" }));
                                        }
                                    }}
                                />
                                {fieldErrors.fundingType && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fundingType}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Duración financiación (meses)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className={`w-full rounded-xl border px-3 py-2 ${fieldErrors.fundingDurationMonths ? "border-red-500 bg-red-50" : ""}`}
                                    value={fundingDurationMonths}
                                    onChange={(e) => {
                                        setFundingDurationMonths(e.target.value);
                                        if (fieldErrors.fundingDurationMonths) {
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                fundingDurationMonths: "",
                                            }));
                                        }
                                    }}
                                />
                                {fieldErrors.fundingDurationMonths && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fundingDurationMonths}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">¿Te trasladarías a Madrid?</label>
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
                                className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
                            >
                                Añadir
                            </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {researchKeywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
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
                        onClick={() => router.push(isEditMode ? "/student/profile" : "/")}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        {isEditMode ? "Volver" : "Volver al inicio"}
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !isFormFilled}
                        className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar perfil"}
                    </button>
                </div>
            </form>
        </main>
    );
}