"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { createRequestAsProfessor } from "@/lib/requests";
import { searchStudentsAdvanced } from "@/lib/search";
import { getDoctoralPrograms, getResearchLines } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { MatchResult } from "@/types/matching";
import { StudentProfile } from "@/types/student";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";
import Image from "next/image";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

function buildCvUrl(cvUrl: string) {
    if (cvUrl.startsWith("http")) {
        return cvUrl;
    }

    return `${FILE_BASE_URL}/files/${cvUrl}`;
}

type ViewMode = "manual" | "automatic";

export default function ProfessorSearchPage() {
    const router = useRouter();

    const [mode, setMode] = useState<ViewMode>("manual");
    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [error, setError] = useState("");

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);
    const [researchLines, setResearchLines] = useState<ResearchLine[]>([]);

    const [name, setName] = useState("");
    const [showResearchLineFilter, setShowResearchLineFilter] = useState(false);
    const [showDoctoralProgramFilter, setShowDoctoralProgramFilter] = useState(false);
    const [showFundingFilter, setShowFundingFilter] = useState(false);
    const [showDedicationFilter, setShowDedicationFilter] = useState(false);
    const [showRelocationFilter, setShowRelocationFilter] = useState(false);
    const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);

    const [researchLineQuery, setResearchLineQuery] = useState("");
    const [selectedResearchLineIds, setSelectedResearchLineIds] = useState<number[]>([]);
    const [selectedDoctoralProgramId, setSelectedDoctoralProgramId] = useState("");
    const [originInstitution, setOriginInstitution] = useState("");
    const [institutionSuggestionOpen, setInstitutionSuggestionOpen] = useState(false);
    const [hasFunding, setHasFunding] = useState("any");
    const [dedicationType, setDedicationType] = useState("any");
    const [willingToRelocate, setWillingToRelocate] = useState("any");

    const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
    const [manualBaseResults, setManualBaseResults] = useState<StudentProfile[]>([]);
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

    const [requestStudentUserId, setRequestStudentUserId] = useState<number | null>(null);
    const [requestStudentName, setRequestStudentName] = useState("");
    const [requestSubject, setRequestSubject] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
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
        }
    }, [router]);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [programs, lines, students] = await Promise.all([
                    getDoctoralPrograms(),
                    getResearchLines(),
                    searchStudentsAdvanced({}),
                ]);

                setDoctoralPrograms(programs);
                setResearchLines(lines);
                setAllStudents(students);
                setManualBaseResults(students);
            } catch (e) {
                console.error(e);
                setError(e instanceof Error ? e.message : "No se pudo cargar la información inicial");
            } finally {
                setCatalogLoading(false);
            }
        }

        loadInitialData();
    }, []);

    const manualHasFilters = useMemo(() => {
        return (
            (showResearchLineFilter && selectedResearchLineIds.length > 0) ||
            (showDoctoralProgramFilter && selectedDoctoralProgramId !== "") ||
            (showFundingFilter && hasFunding !== "any") ||
            (showDedicationFilter && dedicationType !== "any") ||
            (showRelocationFilter && willingToRelocate !== "any") ||
            (showInstitutionFilter && originInstitution.trim() !== "")
        );
    }, [
        showResearchLineFilter,
        selectedResearchLineIds,
        showDoctoralProgramFilter,
        selectedDoctoralProgramId,
        showFundingFilter,
        hasFunding,
        showDedicationFilter,
        dedicationType,
        showRelocationFilter,
        willingToRelocate,
        showInstitutionFilter,
        originInstitution,
    ]);

    const manualResults = useMemo(() => {
        const normalizedName = name.trim().toLowerCase();

        if (!normalizedName) {
            return manualBaseResults;
        }

        return manualBaseResults.filter((student) =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(normalizedName)
        );
    }, [manualBaseResults, name]);

    const filteredResearchLines = useMemo(() => {
        const query = researchLineQuery.trim().toLowerCase();

        if (!query) {
            return [];
        }

        return researchLines
            .filter((line) => !selectedResearchLineIds.includes(line.id))
            .filter((line) => line.name.toLowerCase().includes(query))
            .slice(0, 8);
    }, [researchLineQuery, researchLines, selectedResearchLineIds]);

    function addResearchLine(line: ResearchLine) {
        setSelectedResearchLineIds((current) => [...current, line.id]);
        setResearchLineQuery("");
    }

    function removeResearchLine(lineId: number) {
        setSelectedResearchLineIds((current) =>
            current.filter((id) => id !== lineId)
        );
    }

    async function handleManualSearch() {
        setLoading(true);
        setError("");

        try {
            if (!manualHasFilters) {
                setManualBaseResults(allStudents);
                return;
            }

            const data = await searchStudentsAdvanced({
                researchLineIds:
                    showResearchLineFilter && selectedResearchLineIds.length > 0
                        ? selectedResearchLineIds
                        : undefined,
                doctoralProgramIds:
                    showDoctoralProgramFilter && selectedDoctoralProgramId
                        ? [Number(selectedDoctoralProgramId)]
                        : undefined,
                hasFunding:
                    showFundingFilter && hasFunding !== "any"
                        ? hasFunding === "true"
                        : undefined,
                dedicationType:
                    showDedicationFilter && dedicationType !== "any"
                        ? dedicationType
                        : undefined,
                willingToRelocateToMadrid:
                    showRelocationFilter && willingToRelocate !== "any"
                        ? willingToRelocate === "true"
                        : undefined,
                originInstitution:
                    showInstitutionFilter ? originInstitution.trim() || undefined : undefined,
            });

            setManualBaseResults(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    }

    const filteredInstitutions = useMemo(() => {
        if (!institutionSuggestionOpen) {
            return [];
        }

        const query = originInstitution.trim().toLowerCase();

        if (!query) {
            return [];
        }

        const institutions = Array.from(
            new Set(
                allStudents
                    .map((student) => student.originInstitution)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        );

        return institutions
            .filter((value) => value.toLowerCase().includes(query))
            .slice(0, 8);
    }, [originInstitution, allStudents, institutionSuggestionOpen]);

    async function handleAutomaticSearch() {
        setLoading(true);
        setError("");

        try {
            const data = await apiFetch<MatchResult[]>("/matching/students");
            setMatchResults(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    }

    function openRequestModal(userId: number, fullName: string) {
        setRequestStudentUserId(userId);
        setRequestStudentName(fullName);
        setRequestSubject("");
        setRequestMessage("");
    }

    async function handleSendRequest() {
        if (!requestStudentUserId || !requestSubject.trim() || !requestMessage.trim()) {
            return;
        }

        setSending(true);
        setError("");

        try {
            await createRequestAsProfessor({
                studentUserId: requestStudentUserId,
                subject: requestSubject.trim(),
                message: requestMessage.trim(),
            });

            setRequestStudentUserId(null);
            setRequestStudentName("");
            setRequestSubject("");
            setRequestMessage("");
            alert("Solicitud enviada correctamente");
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "No se pudo enviar la solicitud");
        } finally {
            setSending(false);
        }
    }

    function clearManualFilters() {
        setName("");
        setSelectedResearchLineIds([]);
        setResearchLineQuery("");
        setSelectedDoctoralProgramId("");
        setHasFunding("any");
        setDedicationType("any");
        setWillingToRelocate("any");
        setOriginInstitution("");
        setShowResearchLineFilter(false);
        setShowDoctoralProgramFilter(false);
        setShowFundingFilter(false);
        setShowDedicationFilter(false);
        setShowRelocationFilter(false);
        setShowInstitutionFilter(false);
        setManualBaseResults(allStudents);
    }

    function openStudentProfile(matchStudent: MatchResult) {
        const student =
            allStudents.find((st) => st.userId === matchStudent.userId) ||
            allStudents.find(
                (st) =>
                    st.email?.toLowerCase() === matchStudent.email?.toLowerCase()
            ) ||
            allStudents.find(
                (st) =>
                    `${st.firstName} ${st.lastName}`.trim().toLowerCase() ===
                    matchStudent.fullName.trim().toLowerCase()
            );

        if (!student) {
            setError("No se ha podido cargar el perfil completo del estudiante.");
            return;
        }

        setSelectedStudent(student);
    }

    const isRequestValid =
        requestSubject.trim() !== "" && requestMessage.trim() !== "";

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.push("/professor/dashboard")}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                    >
                        ←
                    </button>

                    <div className="flex gap-4">
                        <Image
                            src="/thesismatch-logo.jpeg"
                            alt="Logo ThesisMatch"
                            width={200}
                            height={150}
                            className="hidden rounded-xl sm:block"
                        />

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                                Área de profesor
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                                Búsqueda de estudiantes de tesis
                            </h1>
                            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
                                Consulta estudiantes registrados mediante filtros estructurados o utiliza la búsqueda automática basada en compatibilidad académica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-2 shadow-lg shadow-slate-200/70">
                <button
                    onClick={() => setMode("manual")}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${mode === "manual"
                        ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                >
                    Búsqueda manual
                </button>

                <button
                    onClick={() => setMode("automatic")}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${mode === "automatic"
                        ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                >
                    Búsqueda automática
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">
                    {error}
                </div>
            )}

            {mode === "manual" && (
                <>
                    <section className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur md:p-8">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Buscar nombre de estudiante"
                            className="mb-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <div className="mb-5 grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showResearchLineFilter}
                                    onChange={(e) => setShowResearchLineFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Línea de investigación
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showDoctoralProgramFilter}
                                    onChange={(e) => setShowDoctoralProgramFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Programa de doctorado
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showFundingFilter}
                                    onChange={(e) => setShowFundingFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Financiación
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showDedicationFilter}
                                    onChange={(e) => setShowDedicationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Dedicación
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showRelocationFilter}
                                    onChange={(e) => setShowRelocationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Traslado a Madrid
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={showInstitutionFilter}
                                    onChange={(e) => setShowInstitutionFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Institución de origen
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {showResearchLineFilter && (
                                <div className="relative">
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            {selectedResearchLineIds.map((id) => {
                                                const line = researchLines.find((item) => item.id === id);

                                                if (!line) {
                                                    return null;
                                                }

                                                return (
                                                    <span
                                                        key={id}
                                                        className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                                    >
                                                        {line.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeResearchLine(id)}
                                                            className="text-blue-500 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <input
                                            value={researchLineQuery}
                                            onChange={(e) => setResearchLineQuery(e.target.value)}
                                            placeholder="Escribe una línea de investigación..."
                                            className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                            disabled={catalogLoading}
                                        />
                                    </div>

                                    {filteredResearchLines.length > 0 && (
                                        <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                            {filteredResearchLines.map((line) => (
                                                <button
                                                    key={line.id}
                                                    type="button"
                                                    onClick={() => addResearchLine(line)}
                                                    className="block w-full rounded-xl px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    {line.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showDoctoralProgramFilter && (
                                <select
                                    value={selectedDoctoralProgramId}
                                    onChange={(e) => setSelectedDoctoralProgramId(e.target.value)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    disabled={catalogLoading}
                                >
                                    <option value="">Seleccione un programa</option>
                                    {doctoralPrograms.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {showFundingFilter && (
                                <select
                                    value={hasFunding}
                                    onChange={(e) => setHasFunding(e.target.value)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="true">Con financiación</option>
                                    <option value="false">Sin financiación</option>
                                </select>
                            )}

                            {showDedicationFilter && (
                                <select
                                    value={dedicationType}
                                    onChange={(e) => setDedicationType(e.target.value)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="FULL_TIME">Tiempo completo</option>
                                    <option value="PART_TIME">Tiempo parcial</option>
                                </select>
                            )}

                            {showRelocationFilter && (
                                <select
                                    value={willingToRelocate}
                                    onChange={(e) => setWillingToRelocate(e.target.value)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            )}

                            {showInstitutionFilter && (
                                <div className="relative">
                                    <input
                                        value={originInstitution}
                                        onChange={(e) => {
                                            setOriginInstitution(e.target.value);
                                            setInstitutionSuggestionOpen(true);
                                        }}
                                        onFocus={() => {
                                            if (originInstitution.trim()) {
                                                setInstitutionSuggestionOpen(true);
                                            }
                                        }}
                                        onBlur={() => setInstitutionSuggestionOpen(false)}
                                        placeholder="Escribe una institución..."
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    {filteredInstitutions.length > 0 && (
                                        <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                            {filteredInstitutions.map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setOriginInstitution(value);
                                                        setInstitutionSuggestionOpen(false);
                                                    }}
                                                    className="block w-full rounded-xl px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button
                                onClick={handleManualSearch}
                                disabled={loading}
                                className="rounded-2xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>

                            <button
                                onClick={clearManualFilters}
                                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Limpiar
                            </button>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Nombre y apellidos estudiante
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Perfil estudiante
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        ¿Desea enviar solicitud al estudiante?
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {manualResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-16 text-center text-sm text-slate-500">
                                            No hay estudiantes que coincidan con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    manualResults.map((student) => (
                                        <tr key={student.id} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                                            <td className="px-5 py-5 text-sm font-medium text-slate-900">
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="px-5 py-5">
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                >
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button
                                                    onClick={() =>
                                                        openRequestModal(
                                                            student.userId,
                                                            `${student.firstName} ${student.lastName}`
                                                        )
                                                    }
                                                    className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
                                                >
                                                    Enviar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </>
            )}

            {mode === "automatic" && (
                <>
                    <section className="mb-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">
                        <button
                            onClick={handleAutomaticSearch}
                            disabled={loading}
                            className="rounded-2xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Cargando matches..." : "Cargar matches automáticos"}
                        </button>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Estudiante
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Compatibilidad
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Detalle
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Perfil
                                    </th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">
                                        Solicitud
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                                            No hay resultados automáticos cargados.
                                        </td>
                                    </tr>
                                ) : (
                                    matchResults.map((student) => (
                                        <tr key={student.userId} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                                            <td className="px-5 py-5 text-sm font-medium text-slate-900">
                                                {student.fullName}
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                                                    {Math.round(student.totalScore)}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button
                                                    onClick={() => setSelectedMatch(student)}
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button
                                                    onClick={() => openStudentProfile(student)}
                                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                >
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button
                                                    onClick={() => openRequestModal(student.userId, student.fullName)}
                                                    className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
                                                >
                                                    Enviar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </>
            )}

            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {selectedStudent.firstName} {selectedStudent.lastName}
                            </h2>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="grid gap-3 text-lg text-white">
                            <p><b>Email:</b> {selectedStudent.email}</p>
                            <p><b>Institución de origen:</b> {selectedStudent.originInstitution}</p>
                            <p><b>Título provisional:</b> {selectedStudent.proposedThesisTitle}</p>
                            <p><b>Motivación:</b> {selectedStudent.motivation}</p>
                            <p><b>Financiación:</b> {selectedStudent.hasFunding ? "Sí" : "No"}</p>
                            <p><b>Tipo de financiación:</b> {selectedStudent.fundingType || "-"}</p>
                            <p><b>Duración financiación:</b> {selectedStudent.fundingDurationMonths ?? "-"}</p>
                            <p><b>Traslado a Madrid:</b> {selectedStudent.willingToRelocateToMadrid ? "Sí" : "No"}</p>
                            <p>
                                <b>Dedicación:</b>{" "}
                                {selectedStudent.dedicationType === "FULL_TIME"
                                    ? "Tiempo completo"
                                    : "Tiempo parcial"}
                            </p>
                            <p><b>Programas de doctorado:</b> {selectedStudent.doctoralPrograms.join(", ") || "-"}</p>
                            <p><b>Líneas de investigación:</b> {selectedStudent.researchLines.join(", ") || "-"}</p>
                            <p><b>Información adicional:</b> {selectedStudent.additionalInformation || "-"}</p>
                            <p><b>CV:</b>{" "}
                                {selectedStudent.cvUrl ? (
                                    <a
                                        href={buildCvUrl(selectedStudent.cvUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline"
                                    >
                                        Ver CV
                                    </a>
                                ) : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                Detalle de afinidad
                            </h2>
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mb-4 text-lg text-gray-300">
                            <p>
                                <b>Perfil:</b> {selectedMatch.fullName}
                            </p>
                            <p>
                                <b>Afinidad:</b>{" "}
                                <span className="font-bold text-white">
                                    {Math.round(selectedMatch.totalScore)}%
                                </span>
                            </p>
                        </div>

                        <div className="whitespace-pre-line text-base leading-relaxed text-white">
                            {selectedMatch.matchExplanation}
                        </div>
                    </div>
                </div>
            )}

            {requestStudentUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Enviar solicitud</h2>
                            <button
                                onClick={() => setRequestStudentUserId(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <p className="mb-4 text-lg text-gray-300">
                            Estudiante seleccionado: <b>{requestStudentName}</b>
                        </p>

                        <div className="grid gap-4">
                            <input
                                value={requestSubject}
                                onChange={(e) => setRequestSubject(e.target.value)}
                                placeholder="Asunto"
                                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-lg text-white placeholder:text-gray-400"
                            />

                            <textarea
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                placeholder="Mensaje"
                                rows={6}
                                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-lg text-white placeholder:text-gray-400"
                            />

                            <button
                                onClick={handleSendRequest}
                                disabled={sending || !isRequestValid}
                                className="rounded-2xl border border-white bg-white px-6 py-3 text-lg font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {sending ? "Enviando..." : "Enviar solicitud"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}