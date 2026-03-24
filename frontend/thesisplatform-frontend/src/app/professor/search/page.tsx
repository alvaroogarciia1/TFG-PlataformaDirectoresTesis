"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { createRequestAsProfessor } from "@/lib/requests";
import {
    searchStudentsAdvanced,
    searchStudentsByTitle,
} from "@/lib/search";
import { getDoctoralPrograms, getResearchLines } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { MatchResult } from "@/types/matching";
import { StudentProfile } from "@/types/student";
import { DoctoralProgram, ResearchLine } from "@/types/catalog";

type ViewMode = "manual" | "automatic";

export default function ProfessorSearchPage() {
    const router = useRouter();

    const [mode, setMode] = useState<ViewMode>("manual");
    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [error, setError] = useState("");

    const [doctoralPrograms, setDoctoralPrograms] = useState<DoctoralProgram[]>([]);
    const [researchLines, setResearchLines] = useState<ResearchLine[]>([]);

    const [title, setTitle] = useState("");
    const [showResearchLineFilter, setShowResearchLineFilter] = useState(false);
    const [showDoctoralProgramFilter, setShowDoctoralProgramFilter] = useState(false);
    const [showFundingFilter, setShowFundingFilter] = useState(false);
    const [showDedicationFilter, setShowDedicationFilter] = useState(false);
    const [showRelocationFilter, setShowRelocationFilter] = useState(false);
    const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);

    const [selectedResearchLineId, setSelectedResearchLineId] = useState("");
    const [selectedDoctoralProgramId, setSelectedDoctoralProgramId] = useState("");
    const [originInstitution, setOriginInstitution] = useState("");
    const [hasFunding, setHasFunding] = useState("any");
    const [dedicationType, setDedicationType] = useState("any");
    const [willingToRelocate, setWillingToRelocate] = useState("any");

    const [manualResults, setManualResults] = useState<StudentProfile[]>([]);
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
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
            title.trim() !== "" ||
            (showResearchLineFilter && selectedResearchLineId !== "") ||
            (showDoctoralProgramFilter && selectedDoctoralProgramId !== "") ||
            (showFundingFilter && hasFunding !== "any") ||
            (showDedicationFilter && dedicationType !== "any") ||
            (showRelocationFilter && willingToRelocate !== "any") ||
            (showInstitutionFilter && originInstitution.trim() !== "")
        );
    }, [
        title,
        showResearchLineFilter,
        selectedResearchLineId,
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

    async function handleManualSearch() {
        setLoading(true);
        setError("");

        try {
            const onlyTitle =
                title.trim() !== "" &&
                (!showResearchLineFilter || selectedResearchLineId === "") &&
                (!showDoctoralProgramFilter || selectedDoctoralProgramId === "") &&
                (!showFundingFilter || hasFunding === "any") &&
                (!showDedicationFilter || dedicationType === "any") &&
                (!showRelocationFilter || willingToRelocate === "any") &&
                (!showInstitutionFilter || originInstitution.trim() === "");

            if (onlyTitle) {
                const data = await searchStudentsByTitle(title.trim());
                setManualResults(data);
            } else {
                const data = await searchStudentsAdvanced({
                    researchLineIds:
                        showResearchLineFilter && selectedResearchLineId
                            ? [Number(selectedResearchLineId)]
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
        setTitle("");
        setSelectedResearchLineId("");
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
        setManualResults([]);
    }

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-white">
            <div className="mb-8 flex items-start gap-4">
                <button
                    onClick={() => router.push("/professor/dashboard")}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white text-2xl transition hover:bg-white/10"
                >
                    ←
                </button>

                <div className="flex-1">
                    <h1 className="mb-3 text-3xl font-bold">Búsqueda de estudiantes de tesis</h1>
                    <p className="max-w-4xl text-lg italic text-gray-300">
                        Puede buscar estudiantes por título provisional o aplicar filtros para
                        acotar resultados. También puede consultar la búsqueda automática.
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Buscar título provisional"
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
                                    checked={showFundingFilter}
                                    onChange={(e) => setShowFundingFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Financiación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showDedicationFilter}
                                    onChange={(e) => setShowDedicationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Dedicación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
                                <input
                                    type="checkbox"
                                    checked={showRelocationFilter}
                                    onChange={(e) => setShowRelocationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Traslado a Madrid
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-white">
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

                            {showFundingFilter && (
                                <select
                                    value={hasFunding}
                                    onChange={(e) => setHasFunding(e.target.value)}
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
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
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="FULL_TIME">FULL_TIME</option>
                                    <option value="PART_TIME">PART_TIME</option>
                                </select>
                            )}

                            {showRelocationFilter && (
                                <select
                                    value={willingToRelocate}
                                    onChange={(e) => setWillingToRelocate(e.target.value)}
                                    className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-[16px] text-white"
                                >
                                    <option value="any">Cualquiera</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            )}

                            {showInstitutionFilter && (
                                <input
                                    value={originInstitution}
                                    onChange={(e) => setOriginInstitution(e.target.value)}
                                    placeholder="Institución de origen"
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
                                        Nombre y apellidos estudiante
                                    </th>
                                    <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        Perfil estudiante
                                    </th>
                                    <th className="border-b border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                        ¿Desea enviar solicitud al estudiante?
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
                                    manualResults.map((student) => (
                                        <tr key={student.id} className="border-t border-white">
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="border-r border-white px-4 py-5">
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
                                                >
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() =>
                                                        openRequestModal(
                                                            student.userId,
                                                            `${student.firstName} ${student.lastName}`
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
                                        Estudiante
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
                                    matchResults.map((student) => (
                                        <tr key={student.userId} className="border-t border-white">
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {student.fullName}
                                            </td>
                                            <td className="border-r border-white px-4 py-5 text-lg">
                                                {student.totalScore.toFixed(2)}
                                            </td>
                                            <td className="border-r border-white px-4 py-5">
                                                {student.matchExplanation}
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() => openRequestModal(student.userId, student.fullName)}
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

            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
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
                            <p><b>Dedicación:</b> {selectedStudent.dedicationType}</p>
                            <p><b>Programas de doctorado:</b> {selectedStudent.doctoralPrograms.join(", ") || "-"}</p>
                            <p><b>Líneas de investigación:</b> {selectedStudent.researchLines.join(", ") || "-"}</p>
                            <p><b>Información adicional:</b> {selectedStudent.additionalInformation || "-"}</p>
                        </div>
                    </div>
                </div>
            )}

            {requestStudentUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Enviar solicitud</h2>
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