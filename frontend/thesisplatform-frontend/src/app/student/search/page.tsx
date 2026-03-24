"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { createRequest } from "@/lib/requests";
import {
    searchProfessorsAdvanced,
    searchProfessorsByName,
} from "@/lib/search";
import { getDoctoralPrograms, getResearchLines } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { MatchResult } from "@/types/matching";
import { ProfessorProfile } from "@/types/professor";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";

type ViewMode = "manual" | "automatic";

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

    const [manualResults, setManualResults] = useState<ProfessorProfile[]>([]);
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

    const [selectedProfessor, setSelectedProfessor] = useState<ProfessorProfile | null>(null);
    const [requestProfessorUserId, setRequestProfessorUserId] = useState<number | null>(null);
    const [requestProfessorName, setRequestProfessorName] = useState("");
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

        if (user.role !== "STUDENT") {
            router.replace("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        async function loadCatalog() {
            try {
                const [programs, lines] = await Promise.all([
                    getDoctoralPrograms(),
                    getResearchLines(),
                ]);
                setDoctoralPrograms(programs);
                setResearchLines(lines);
            } catch (e) {
                console.error(e);
                setError(e instanceof Error ? e.message : "No se pudo cargar el catálogo");
            } finally {
                setCatalogLoading(false);
            }
        }

        loadCatalog();
    }, []);

    const manualHasFilters = useMemo(() => {
        return (
            name.trim() !== "" ||
            (showResearchLineFilter && selectedResearchLineId !== "") ||
            (showDoctoralProgramFilter && selectedDoctoralProgramId !== "") ||
            (showInstitutionFilter && institution.trim() !== "") ||
            (showAvailabilityFilter && availableToSupervise !== "any")
        );
    }, [
        name,
        showResearchLineFilter,
        selectedResearchLineId,
        showDoctoralProgramFilter,
        selectedDoctoralProgramId,
        showInstitutionFilter,
        institution,
        showAvailabilityFilter,
        availableToSupervise,
    ]);

    async function handleManualSearch() {
        setLoading(true);
        setError("");

        try {
            const onlyName =
                name.trim() !== "" &&
                (!showResearchLineFilter || selectedResearchLineId === "") &&
                (!showDoctoralProgramFilter || selectedDoctoralProgramId === "") &&
                (!showInstitutionFilter || institution.trim() === "") &&
                (!showAvailabilityFilter || availableToSupervise === "any");

            if (onlyName) {
                const data = await searchProfessorsByName(name.trim());
                setManualResults(data);
            } else {
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

                setManualResults(data);
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    }

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

    function openRequestModal(userId: number, fullName: string) {
        setRequestProfessorUserId(userId);
        setRequestProfessorName(fullName);
        setRequestSubject("");
        setRequestMessage("");
    }

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
        setManualResults([]);
    }

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-white">
            <div className="mb-8 flex items-start gap-4">
                <button
                    onClick={() => router.push("/student/dashboard")}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white text-2xl transition hover:bg-white/10"
                >
                    ←
                </button>

                <div className="flex-1">
                    <h1 className="mb-3 text-3xl font-bold">Búsqueda de directores de tesis</h1>
                    <p className="max-w-4xl text-lg italic text-gray-300">
                        Puede buscar profesores por nombre o aplicar filtros para afinar resultados.
                        También puede consultar la búsqueda automática basada en compatibilidad.
                    </p>
                </div>
            </div>

            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setMode("manual")}
                    className={`rounded-xl px-5 py-3 font-medium transition ${mode === "manual"
                        ? "border border-white bg-white text-black"
                        : "border border-white text-white hover:bg-white/10"
                        }`}
                >
                    Búsqueda manual
                </button>

                <button
                    onClick={() => setMode("automatic")}
                    className={`rounded-xl px-5 py-3 font-medium transition ${mode === "automatic"
                        ? "border border-white bg-white text-black"
                        : "border border-white text-white hover:bg-white/10"
                        }`}
                >
                    Búsqueda automática
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-400 bg-red-950/40 px-4 py-3 text-red-300">
                    {error}
                </div>
            )}

            {mode === "manual" && (
                <>
                    <section className="mb-8 rounded-[2rem] border border-white/20 bg-white/5 p-6 backdrop-blur-sm md:p-8">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Buscar nombre de profesor"
                            className="mb-6 w-full rounded-3xl border border-white/20 bg-white/10 px-6 py-4 text-lg text-white outline-none placeholder:text-gray-400"
                        />

                        <div className="mb-5 grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showResearchLineFilter}
                                    onChange={(e) => setShowResearchLineFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Línea de investigación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showDoctoralProgramFilter}
                                    onChange={(e) => setShowDoctoralProgramFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Programa de doctorado
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showAvailabilityFilter}
                                    onChange={(e) => setShowAvailabilityFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Disponibilidad
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showInstitutionFilter}
                                    onChange={(e) => setShowInstitutionFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Institución
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {showResearchLineFilter && (
                                <select
                                    value={selectedResearchLineId}
                                    onChange={(e) => setSelectedResearchLineId(e.target.value)}
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
                                    disabled={catalogLoading}
                                >
                                    <option value="">Seleccione una línea</option>
                                    {researchLines.map((line) => (
                                        <option key={line.id} value={line.id}>
                                            {line.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {showDoctoralProgramFilter && (
                                <select
                                    value={selectedDoctoralProgramId}
                                    onChange={(e) => setSelectedDoctoralProgramId(e.target.value)}
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
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

                            {showAvailabilityFilter && (
                                <select
                                    value={availableToSupervise}
                                    onChange={(e) => setAvailableToSupervise(e.target.value)}
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="true">Disponible</option>
                                    <option value="false">No disponible</option>
                                </select>
                            )}

                            {showInstitutionFilter && (
                                <input
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    placeholder="Institución"
                                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-[16px] text-white placeholder:text-gray-400"
                                />
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button
                                onClick={handleManualSearch}
                                disabled={loading || !manualHasFilters}
                                className="rounded-2xl border border-white bg-white px-8 py-3 text-lg font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>

                            <button
                                onClick={clearManualFilters}
                                className="rounded-2xl border border-white px-6 py-3 text-lg font-medium text-white transition hover:bg-white/10"
                            >
                                Limpiar
                            </button>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white bg-transparent">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Nombre y apellidos profesor
                                    </th>
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Perfil profesor
                                    </th>
                                    <th className="border-b border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        ¿Desea enviar solicitud al profesor?
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {manualResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-16 text-center text-lg text-gray-400">
                                            No hay resultados de búsqueda manual.
                                        </td>
                                    </tr>
                                ) : (
                                    manualResults.map((prof) => (
                                        <tr key={prof.id} className="border-t border-white">
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {prof.firstName} {prof.lastName}
                                            </td>
                                            <td className="border-r border-white px-4 py-5">
                                                <button
                                                    onClick={() => setSelectedProfessor(prof)}
                                                    className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
                                                >
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() =>
                                                        openRequestModal(
                                                            prof.userId,
                                                            `${prof.firstName} ${prof.lastName}`
                                                        )
                                                    }
                                                    className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
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
                    <section className="mb-6">
                        <button
                            onClick={handleAutomaticSearch}
                            disabled={loading}
                            className="rounded-2xl border border-white bg-white px-8 py-3 text-lg font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
                        >
                            {loading ? "Cargando matches..." : "Cargar matches automáticos"}
                        </button>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-white bg-transparent">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Profesor
                                    </th>
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Compatibilidad
                                    </th>
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Detalle
                                    </th>
                                    <th className="border-b border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Solicitud
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-16 text-center text-lg text-gray-400">
                                            No hay resultados automáticos cargados.
                                        </td>
                                    </tr>
                                ) : (
                                    matchResults.map((prof) => (
                                        <tr key={prof.userId} className="border-t border-white">
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {prof.fullName}
                                            </td>
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {prof.totalScore.toFixed(2)}
                                            </td>
                                            <td className="border-r border-white px-4 py-5">
                                                {prof.matchExplanation}
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() => openRequestModal(prof.userId, prof.fullName)}
                                                    className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
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

            {selectedProfessor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
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
                        </div>
                    </div>
                </div>
            )}

            {requestProfessorUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Enviar solicitud</h2>
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
                                disabled={sending}
                                className="rounded-2xl border border-white bg-white px-6 py-3 text-lg font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
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