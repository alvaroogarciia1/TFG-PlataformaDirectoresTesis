"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DoctoralProgram } from "@/types/catalog";
import {
    getMySupervisedTheses,
    createSupervisedThesis,
    deleteSupervisedThesis,
    updateSupervisedThesis,
} from "@/lib/theses";
import type { SupervisedThesis } from "@/types/professor";
import Image from "next/image";

/**
 * Response returned by the backend when retrieving the current professor profile.
 */
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

/**
 * Professor profile creation and edition page.
 *
 * This component allows professor users to complete or update their academic
 * profile, select doctoral programs, define research lines, upload a CV and
 * manage previously supervised or ongoing doctoral theses.
 */
export default function ProfessorProfileSetupPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);

    const [theses, setTheses] = useState<SupervisedThesis[]>([]);

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

    /**
     * Initializes the page by validating the current session, checking that the
     * authenticated user is a professor and loading all data required by the form.
     *
     * If a professor profile already exists, the form is populated and the page
     * switches to edit mode. If the profile does not exist, the page remains in
     * creation mode.
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
                    const loadedTheses = await getMySupervisedTheses();
                    setTheses(loadedTheses);
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
     * Indicates whether all mandatory profile fields are completed.
     *
     * The required fields depend on the current mode:
     * - In creation mode, a CV file must be provided.
     * - In edit mode, either an existing CV or a new CV file is required.
     * - If the professor is available to supervise theses, the maximum number of
     *   doctoral students must also be provided.
     */
    const isFormFilled = useMemo(() => {
        const baseFieldsFilled =
            (!isEditMode ? firstName.trim() !== "" && lastName.trim() !== "" : true) &&
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

    /**
     * Adds or removes a doctoral program from the current selection.
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
     * Normalizes a research keyword by trimming spaces and collapsing repeated
     * whitespace.
     *
     * @param value - Raw keyword entered by the user.
     * @returns Normalized keyword.
     */
    function normalizeKeyword(value: string) {
        return value.trim().replace(/\s+/g, " ");
    }

    /**
     * Adds the current research input as a new keyword, avoiding duplicates in a
     * case-insensitive way.
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
     * Removes a research keyword from the selected list.
     *
     * @param keywordToRemove - Keyword that must be removed.
     */
    function removeKeyword(keywordToRemove: string) {
        setResearchKeywords((prev) =>
            prev.filter((keyword) => keyword !== keywordToRemove)
        );
    }

    /**
     * Creates a keyword when the user presses Enter or comma in the keyword input.
     *
     * @param e - Keyboard event triggered from the research line input.
     */
    function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        }
    }

    /**
     * Validates the selected CV file before allowing it to be submitted.
     *
     * Only PDF files up to 5 MB are accepted.
     *
     * @param file - File selected from the input element.
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
     * Uploads a professor CV file to the backend.
     *
     * @param file - Valid PDF file to upload.
     * @returns Relative or absolute CV URL returned by the backend.
     */
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
    }    /**
     * Creates the professor profile together with the required CV file.
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

    /**
     * Updates the professor profile and uploads a new CV only if the user selected one.
     */
    async function updateProfileAndOptionalCv() {
        const cvUrlToKeep = existingCvUrl || null;

        await apiFetch("/professors/me", {
            method: "PUT",
            body: JSON.stringify({
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

    /**
     * Resets the supervised thesis form and exits thesis edit mode.
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
     * Saves a supervised thesis from the local form.
     *
     * During profile creation, theses are stored locally until the professor
     * profile is created. In edit mode, existing theses are updated directly
     * through the backend.
     */
    async function saveThesisFromSetup() {
        if (
            !thesisForm.doctoralStudentName.trim() ||
            !thesisForm.thesisTitle.trim() ||
            !thesisForm.researchDescription.trim()
        ) {
            setError("Completa doctorando, título y descripción de la tesis.");
            return;
        }

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
            if (isEditMode) {
                const updated = await updateSupervisedThesis(editingThesisId, payload);

                setTheses((prev) =>
                    prev.map((thesis) => thesis.id === editingThesisId ? updated : thesis)
                );
            } else {
                setTheses((prev) =>
                    prev.map((thesis) =>
                        thesis.id === editingThesisId
                            ? { ...thesis, ...payload, id: editingThesisId }
                            : thesis
                    )
                );
            }

            resetThesisForm();
            return;
        }

        const temporaryThesis: SupervisedThesis = {
            id: Date.now(),
            ...payload,
        };

        setTheses((prev) => [temporaryThesis, ...prev]);
        resetThesisForm();
    }

    /**
     * Removes a supervised thesis from the current list.
     *
     * In edit mode, the thesis is also deleted from the backend.
     *
     * @param thesis - Thesis selected for deletion.
     */
    async function removeThesis(thesis: SupervisedThesis) {
        if (isEditMode) {
            await deleteSupervisedThesis(thesis.id);
        }

        setTheses((prev) => prev.filter((item) => item.id !== thesis.id));
    }

    /**
     * Validates the complete professor profile form and persists the data.
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

                for (const thesis of theses) {
                    await createSupervisedThesis({
                        doctoralStudentName: thesis.doctoralStudentName,
                        thesisTitle: thesis.thesisTitle,
                        defenseYear: thesis.defenseYear,
                        researchDescription: thesis.researchDescription,
                        industrialMention: thesis.industrialMention,
                        internationalMention: thesis.internationalMention,
                        results: thesis.results,
                        ongoing: thesis.ongoing,
                    });
                }

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
                        {isEditMode ? "Editar perfil de profesor" : "Registro de profesor"}
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

                    <div className="md:col-span-2 rounded-2xl border p-4">
                        <h2 className="mb-4 text-lg font-semibold">
                            Tesis dirigidas previamente o en curso
                        </h2>

                        <div className="space-y-3">
                            <input
                                className="w-full rounded-xl border px-3 py-2"
                                placeholder="Nombre del doctorando"
                                value={thesisForm.doctoralStudentName}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, doctoralStudentName: e.target.value })
                                }
                            />

                            <input
                                className="w-full rounded-xl border px-3 py-2"
                                placeholder="Título de la tesis"
                                value={thesisForm.thesisTitle}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, thesisTitle: e.target.value })
                                }
                            />

                            <input
                                className="w-full rounded-xl border px-3 py-2"
                                type="number"
                                placeholder="Año de lectura"
                                value={thesisForm.defenseYear}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, defenseYear: e.target.value })
                                }
                            />

                            <textarea
                                className="w-full rounded-xl border px-3 py-2"
                                placeholder="Líneas de investigación / descripción de la tesis"
                                value={thesisForm.researchDescription}
                                onChange={(e) =>
                                    setThesisForm({ ...thesisForm, researchDescription: e.target.value })
                                }
                            />

                            <textarea
                                className="w-full rounded-xl border px-3 py-2"
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
                                    type="button"
                                    onClick={saveThesisFromSetup}
                                    className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
                                >
                                    {editingThesisId !== null ? "Guardar cambios" : "Añadir tesis"}
                                </button>

                                {editingThesisId !== null && (
                                    <button
                                        type="button"
                                        onClick={resetThesisForm}
                                        className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {theses.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No hay tesis registradas.
                                </p>
                            ) : (
                                theses.map((thesis) => (
                                    <div key={thesis.id} className="rounded-xl border p-3">
                                        <p><strong>Título:</strong> {thesis.thesisTitle}</p>
                                        <p><strong>Doctorando:</strong> {thesis.doctoralStudentName}</p>
                                        <p><strong>Año:</strong> {thesis.defenseYear ?? "No indicado"}</p>
                                        <p><strong>Investigación:</strong> {thesis.researchDescription}</p>
                                        <p><strong>Resultados:</strong> {thesis.results || "No indicados"}</p>
                                        <p>
                                            <strong>Estado:</strong>{" "}
                                            {thesis.ongoing ? "En curso" : "Finalizada"}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditThesis(thesis)}
                                                className="rounded-xl border px-3 py-1 text-sm"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => removeThesis(thesis)}
                                                className="rounded-xl border border-red-300 px-3 py-1 text-sm text-red-700"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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