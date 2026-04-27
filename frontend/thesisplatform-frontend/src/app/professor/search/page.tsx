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

    const [selectedResearchLineId, setSelectedResearchLineId] = useState("");
    const [selectedDoctoralProgramId, setSelectedDoctoralProgramId] = useState("");
    const [originInstitution, setOriginInstitution] = useState("");
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
            (showResearchLineFilter && selectedResearchLineId !== "") ||
            (showDoctoralProgramFilter && selectedDoctoralProgramId !== "") ||
            (showFundingFilter && hasFunding !== "any") ||
            (showDedicationFilter && dedicationType !== "any") ||
            (showRelocationFilter && willingToRelocate !== "any") ||
            (showInstitutionFilter && originInstitution.trim() !== "")
        );
    }, [
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

    const manualResults = useMemo(() => {
        const normalizedName = name.trim().toLowerCase();

        if (!normalizedName) {
            return manualBaseResults;
        }

        return manualBaseResults.filter((student) =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(normalizedName)
        );
    }, [manualBaseResults, name]);

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

            setManualBaseResults(data);
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
        setName("");
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
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-gray-900">
            <div className="mb-8 flex items-start gap-4">
                <button
                    onClick={() => router.push("/professor/dashboard")}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-400 text-2xl text-gray-900 transition hover:bg-gray-100"
                >
                    ←
                </button>

                <div className="flex-1">
                    <h1 className="mb-3 text-3xl font-bold">Búsqueda de estudiantes de tesis</h1>
                    <p className="max-w-4xl text-lg italic text-gray-600">
                        Puede consultar todos los estudiantes registrados, filtrar resultados y
                        acotar la lista por nombre. También puede utilizar la búsqueda
                        automática.
                    </p>
                </div>
            </div>

            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setMode("manual")}
                    className={`rounded-xl px-5 py-3 font-medium transition ${mode === "manual"
                        ? "border border-gray-300 bg-white text-gray-900"
                        : "border border-gray-400 text-gray-900 hover:bg-gray-100"
                        }`}
                >
                    Búsqueda manual
                </button>

                <button
                    onClick={() => setMode("automatic")}
                    className={`rounded-xl px-5 py-3 font-medium transition ${mode === "automatic"
                        ? "border border-gray-300 bg-white text-gray-900"
                        : "border border-gray-400 text-gray-900 hover:bg-gray-100"
                        }`}
                >
                    Búsqueda automática
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            {mode === "manual" && (
                <>
                    <section className="mb-8 rounded-[2rem] border border-gray-300 bg-white p-6 md:p-8">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Buscar nombre de estudiante"
                            className="mb-6 w-full rounded-3xl border border-gray-300 bg-white px-6 py-4 text-lg text-gray-900 outline-none placeholder:text-gray-400"
                        />

                        <div className="mb-5 grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={showResearchLineFilter}
                                    onChange={(e) => setShowResearchLineFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Línea de investigación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={showDoctoralProgramFilter}
                                    onChange={(e) => setShowDoctoralProgramFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Programa de doctorado
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={showFundingFilter}
                                    onChange={(e) => setShowFundingFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Financiación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={showDedicationFilter}
                                    onChange={(e) => setShowDedicationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Dedicación
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={showRelocationFilter}
                                    onChange={(e) => setShowRelocationFilter(e.target.checked)}
                                    className="h-5 w-5"
                                />
                                Traslado a Madrid
                            </label>

                            <label className="flex items-center gap-3 text-[16px] font-medium text-gray-900">
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900"
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900"
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900"
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900"
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900"
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
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900 placeholder:text-gray-400"
                                />
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button
                                onClick={handleManualSearch}
                                disabled={loading}
                                className="rounded-2xl border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>

                            <button
                                onClick={clearManualFilters}
                                className="rounded-2xl border border-gray-400 px-6 py-3 text-lg font-medium text-gray-900 transition hover:bg-gray-100"
                            >
                                Limpiar
                            </button>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-gray-300 bg-white">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Nombre y apellidos estudiante
                                    </th>
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Perfil estudiante
                                    </th>
                                    <th className="border-b border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        ¿Desea enviar solicitud al estudiante?
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {manualResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-16 text-center text-lg text-gray-500">
                                            No hay estudiantes que coincidan con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    manualResults.map((student) => (
                                        <tr key={student.id} className="border-t border-gray-300">
                                            <td className="border-r border-gray-300 px-4 py-5 text-lg">
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="border-r border-gray-300 px-4 py-5">
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="rounded-xl border border-gray-400 px-5 py-2 text-gray-900 transition hover:bg-gray-100"
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
                                                    className="rounded-xl border border-gray-400 px-5 py-2 text-gray-900 transition hover:bg-gray-100"
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
                            className="rounded-2xl border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            {loading ? "Cargando matches..." : "Cargar matches automáticos"}
                        </button>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-gray-300 bg-white">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Estudiante
                                    </th>
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Compatibilidad
                                    </th>
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Detalle
                                    </th>
                                    <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Perfil
                                    </th>
                                    <th className="border-b border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                        Solicitud
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-16 text-center text-lg text-gray-500">
                                            No hay resultados automáticos cargados.
                                        </td>
                                    </tr>
                                ) : (
                                    matchResults.map((student) => (
                                        <tr key={student.userId} className="border-t border-gray-300">
                                            <td className="border-r border-gray-300 px-4 py-5 text-lg">
                                                {student.fullName}
                                            </td>
                                            <td className="border-r border-gray-300 px-4 py-5 text-lg">
                                                {Math.round(student.totalScore)}%
                                            </td>
                                            <td className="border-r border-gray-300 px-4 py-5">
                                                <button
                                                    onClick={() => setSelectedMatch(student)}
                                                    className="rounded-xl border border-gray-400 px-4 py-2 text-gray-900 transition hover:bg-gray-100"
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                            <td className="border-r border-gray-300 px-4 py-5">
                                                <button
                                                    onClick={() => openStudentProfile(student)}
                                                    className="rounded-xl border border-gray-400 px-5 py-2 text-gray-900 transition hover:bg-gray-100"
                                                >
                                                    Perfil
                                                </button>
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() => openRequestModal(student.userId, student.fullName)}
                                                    className="rounded-xl border border-gray-400 px-5 py-2 text-gray-900 transition hover:bg-gray-100"
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