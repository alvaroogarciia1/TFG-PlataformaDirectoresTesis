"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { createRequest } from "@/lib/requests";
import { searchProfessorsAdvanced } from "@/lib/search";
import { getDoctoralPrograms, getResearchLines } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { MatchResult } from "@/types/matching";
import { ProfessorProfile } from "@/types/professor";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";
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

type ViewMode = "manual" | "automatic";

/**
 * Student search page.
 *
 * Allows students to search for professors manually using structured filters or
 * automatically using the matching system. It also provides profile inspection,
 * affinity detail display and formal thesis supervision request creation.
 */
export default function StudentSearchPage() {
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
    const [showAvailabilityFilter, setShowAvailabilityFilter] = useState(false);
    const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);

    const [selectedResearchLineId, setSelectedResearchLineId] = useState("");
    const [selectedDoctoralProgramId, setSelectedDoctoralProgramId] = useState("");
    const [institution, setInstitution] = useState("");
    const [availableToSupervise, setAvailableToSupervise] = useState("any");

    const [allProfessors, setAllProfessors] = useState<ProfessorProfile[]>([]);
    const [manualBaseResults, setManualBaseResults] = useState<ProfessorProfile[]>([]);
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

    const [selectedProfessor, setSelectedProfessor] = useState<ProfessorProfile | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

    const [requestProfessorUserId, setRequestProfessorUserId] = useState<number | null>(null);
    const [requestProfessorName, setRequestProfessorName] = useState("");
    const [requestSubject, setRequestSubject] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [sending, setSending] = useState(false);

    /**
     * Protects the page so only authenticated student users can access it.
     */
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

        if (user.role !== "STUDENT") {
            router.replace("/dashboard");
        }
    }, [router]);

    /**
     * Loads the catalog data and the initial list of professors used by manual
     * search and profile resolution from automatic match results.
     */
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [programs, lines, professors] = await Promise.all([
                    getDoctoralPrograms(),
                    getResearchLines(),
                    searchProfessorsAdvanced({}),
                ]);

                setDoctoralPrograms(programs);
                setResearchLines(lines);
                setAllProfessors(professors);
                setManualBaseResults(professors);
            } catch (e) {
                console.error(e);
                setError(e instanceof Error ? e.message : "No se pudo cargar la información inicial");
            } finally {
                setCatalogLoading(false);
            }
        }

        loadInitialData();
    }, []);

    /**
     * Indicates whether any advanced manual filter is active.
     */
    const manualHasFilters = useMemo(() => {
        return (
            (showResearchLineFilter && selectedResearchLineId !== "") ||
            (showDoctoralProgramFilter && selectedDoctoralProgramId !== "") ||
            (showInstitutionFilter && institution.trim() !== "") ||
            (showAvailabilityFilter && availableToSupervise !== "any")
        );
    }, [
        showResearchLineFilter,
        selectedResearchLineId,
        showDoctoralProgramFilter,
        selectedDoctoralProgramId,
        showInstitutionFilter,
        institution,
        showAvailabilityFilter,
        availableToSupervise,
    ]);

    /**
     * Applies the free-text professor name filter over the current manual result set.
     */
    const manualResults = useMemo(() => {
        const normalizedName = name.trim().toLowerCase();

        if (!normalizedName) {
            return manualBaseResults;
        }

        return manualBaseResults.filter((prof) =>
            `${prof.firstName} ${prof.lastName}`.toLowerCase().includes(normalizedName)
        );
    }, [manualBaseResults, name]);

    /**
     * Runs the manual search using the selected structured filters.
     */
    async function handleManualSearch() {
        setLoading(true);
        setError("");

        try {
            if (!manualHasFilters) {
                setManualBaseResults(allProfessors);
                return;
            }

            const data = await searchProfessorsAdvanced({
                researchLineIds:
                    showResearchLineFilter && selectedResearchLineId
                        ? [Number(selectedResearchLineId)]
                        : undefined,
                doctoralProgramIds:
                    showDoctoralProgramFilter && selectedDoctoralProgramId
                        ? [Number(selectedDoctoralProgramId)]
                        : undefined,
                institution: showInstitutionFilter ? institution.trim() || undefined : undefined,
                availableToSupervise:
                    showAvailabilityFilter && availableToSupervise !== "any"
                        ? availableToSupervise === "true"
                        : undefined,
            });

            setManualBaseResults(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    }

    /**
     * Runs the automatic professor matching search for the current student.
     */
    async function handleAutomaticSearch() {
        setLoading(true);
        setError("");

        try {
            const data = await apiFetch<MatchResult[]>("/matching/professors");
            setMatchResults(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    }

    /**
     * Opens the thesis supervision request modal for the selected professor.
     *
     * @param userId - User identifier of the professor.
     * @param fullName - Full name of the professor.
     */
    function openRequestModal(userId: number, fullName: string) {
        setRequestProfessorUserId(userId);
        setRequestProfessorName(fullName);
        setRequestSubject("");
        setRequestMessage("");
    }

    /**
     * Sends a formal thesis supervision request to the selected professor.
     */
    async function handleSendRequest() {
        if (!requestProfessorUserId || !requestSubject.trim() || !requestMessage.trim()) {
            return;
        }

        setSending(true);
        setError("");

        try {
            await createRequest({
                professorUserId: requestProfessorUserId,
                subject: requestSubject.trim(),
                message: requestMessage.trim(),
            });

            setRequestProfessorUserId(null);
            setRequestProfessorName("");
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

    /**
     * Clears all manual search filters and restores the initial professor list.
     */
    function clearManualFilters() {
        setName("");
        setSelectedResearchLineId("");
        setSelectedDoctoralProgramId("");
        setInstitution("");
        setAvailableToSupervise("any");
        setShowResearchLineFilter(false);
        setShowDoctoralProgramFilter(false);
        setShowAvailabilityFilter(false);
        setShowInstitutionFilter(false);
        setManualBaseResults(allProfessors);
    }

    /**
     * Resolves a complete professor profile from an automatic match result and
     * opens it in the profile modal.
     *
     * @param matchProfessor - Professor match returned by the automatic search.
     */
    function openProfessorProfile(matchProfessor: MatchResult) {
        const professor =
            allProfessors.find((prof) => prof.userId === matchProfessor.userId) ||
            allProfessors.find(
                (prof) =>
                    prof.email?.toLowerCase() === matchProfessor.email?.toLowerCase()
            ) ||
            allProfessors.find(
                (prof) =>
                    `${prof.firstName} ${prof.lastName}`.trim().toLowerCase() ===
                    matchProfessor.fullName.trim().toLowerCase()
            );

        if (!professor) {
            setError("No se ha podido cargar el perfil completo del profesor.");
            return;
        }

        setSelectedProfessor(professor);
    }
    const isRequestValid =
        requestSubject.trim() !== "" && requestMessage.trim() !== "";

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.push("/student/dashboard")}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                    >
                        ←
                    </button>

                    <div className="flex gap-4">
                        <Image
                            src="/thesismatch-logo.jpeg"
                            alt="Logo ThesisMatch"
                            width={52}
                            height={52}
                            className="hidden rounded-xl sm:block"
                        />

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                                Área de estudiante
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                                Búsqueda de directores de tesis
                            </h1>
                            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
                                Consulta profesores disponibles mediante filtros estructurados o utiliza la búsqueda automática basada en compatibilidad académica.
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
                            placeholder="Buscar nombre de profesor"
                            className="mb-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <div className="mb-5 grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input type="checkbox" checked={showResearchLineFilter} onChange={(e) => setShowResearchLineFilter(e.target.checked)} className="h-5 w-5" />
                                Línea de investigación
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input type="checkbox" checked={showDoctoralProgramFilter} onChange={(e) => setShowDoctoralProgramFilter(e.target.checked)} className="h-5 w-5" />
                                Programa de doctorado
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input type="checkbox" checked={showAvailabilityFilter} onChange={(e) => setShowAvailabilityFilter(e.target.checked)} className="h-5 w-5" />
                                Disponibilidad
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input type="checkbox" checked={showInstitutionFilter} onChange={(e) => setShowInstitutionFilter(e.target.checked)} className="h-5 w-5" />
                                Institución
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {showResearchLineFilter && (
                                <select value={selectedResearchLineId} onChange={(e) => setSelectedResearchLineId(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" disabled={catalogLoading}>
                                    <option value="">Seleccione una línea</option>
                                    {researchLines.map((line) => (
                                        <option key={line.id} value={line.id}>{line.name}</option>
                                    ))}
                                </select>
                            )}

                            {showDoctoralProgramFilter && (
                                <select value={selectedDoctoralProgramId} onChange={(e) => setSelectedDoctoralProgramId(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" disabled={catalogLoading}>
                                    <option value="">Seleccione un programa</option>
                                    {doctoralPrograms.map((program) => (
                                        <option key={program.id} value={program.id}>{program.name}</option>
                                    ))}
                                </select>
                            )}

                            {showAvailabilityFilter && (
                                <select value={availableToSupervise} onChange={(e) => setAvailableToSupervise(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                    <option value="any">Cualquiera</option>
                                    <option value="true">Disponible</option>
                                    <option value="false">No disponible</option>
                                </select>
                            )}

                            {showInstitutionFilter && (
                                <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institución" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button onClick={handleManualSearch} disabled={loading} className="rounded-2xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                                {loading ? "Buscando..." : "Buscar"}
                            </button>

                            <button onClick={clearManualFilters} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                Limpiar
                            </button>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Nombre y apellidos profesor</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Perfil profesor</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Solicitud</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manualResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-16 text-center text-sm text-slate-500">
                                            No hay profesores que coincidan con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    manualResults.map((prof) => (
                                        <tr key={prof.id} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                                            <td className="px-5 py-5 text-sm font-medium text-slate-900">{prof.firstName} {prof.lastName}</td>
                                            <td className="px-5 py-5">
                                                <button onClick={() => setSelectedProfessor(prof)} className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button onClick={() => openRequestModal(prof.userId, `${prof.firstName} ${prof.lastName}`)} className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800">
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
                        <button onClick={handleAutomaticSearch} disabled={loading} className="rounded-2xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {loading ? "Cargando matches..." : "Cargar matches automáticos"}
                        </button>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Profesor</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Compatibilidad</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Detalle</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Perfil</th>
                                    <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-bold text-slate-700">Solicitud</th>
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
                                    matchResults.map((prof) => (
                                        <tr key={prof.userId} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                                            <td className="px-5 py-5 text-sm font-medium text-slate-900">{prof.fullName}</td>
                                            <td className="px-5 py-5">
                                                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                                                    {Math.round(prof.totalScore)}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button onClick={() => setSelectedMatch(prof)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                                    Ver detalle
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button onClick={() => openProfessorProfile(prof)} className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-5 py-5">
                                                <button onClick={() => openRequestModal(prof.userId, prof.fullName)} className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800">
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

            {selectedProfessor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {selectedProfessor.firstName} {selectedProfessor.lastName}
                            </h2>
                            <button
                                onClick={() => setSelectedProfessor(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="grid gap-3 text-lg text-white">
                            <p><b>Email:</b> {selectedProfessor.email}</p>
                            <p><b>Institución:</b> {selectedProfessor.institution}</p>
                            <p><b>Departamento:</b> {selectedProfessor.department || "-"}</p>
                            <p><b>Disponible para supervisar:</b> {selectedProfessor.availableToSupervise ? "Sí" : "No"}</p>
                            <p><b>Número máximo de doctorandos:</b> {selectedProfessor.maxPhdStudents ?? "-"}</p>
                            <p><b>Programas de doctorado:</b> {selectedProfessor.doctoralPrograms.join(", ") || "-"}</p>
                            <p><b>Líneas de investigación:</b> {selectedProfessor.researchLines.join(", ") || "-"}</p>
                            <p><b>Información adicional:</b> {selectedProfessor.additionalInformation || "-"}</p>
                            <div>
                                <b>Tesis dirigidas previamente o en curso:</b>
                                <div className="mt-2 space-y-3">
                                    {(selectedProfessor.supervisedTheses || []).length > 0 ? (
                                        selectedProfessor.supervisedTheses!.map((thesis) => (
                                            <div key={thesis.id} className="rounded-xl border border-white/30 p-3">
                                                <p><b>Título:</b> {thesis.thesisTitle}</p>
                                                <p><b>Doctorando:</b> {thesis.doctoralStudentName}</p>
                                                <p><b>Año:</b> {thesis.defenseYear ?? "No indicado"}</p>
                                                <p><b>Investigación:</b> {thesis.researchDescription}</p>
                                                <p><b>Resultados:</b> {thesis.results || "No indicados"}</p>
                                                <p>
                                                    <b>Menciones:</b>{" "}
                                                    {thesis.industrialMention ? "Industrial " : ""}
                                                    {thesis.internationalMention ? "Internacional " : ""}
                                                    {!thesis.industrialMention && !thesis.internationalMention
                                                        ? "Sin menciones"
                                                        : ""}
                                                </p>
                                                <p><b>Estado:</b> {thesis.ongoing ? "En curso" : "Finalizada"}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-300">No hay tesis registradas.</p>
                                    )}
                                </div>
                            </div>
                            <p><b>CV:</b>{" "}
                                {selectedProfessor.cvUrl ? (
                                    <a
                                        href={buildCvUrl(selectedProfessor.cvUrl)}
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

            {requestProfessorUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Enviar solicitud</h2>
                            <button
                                onClick={() => setRequestProfessorUserId(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <p className="mb-4 text-lg text-gray-300">
                            Profesor seleccionado: <b>{requestProfessorName}</b>
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