"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearSession, getUser, isAuthenticated, logout } from "@/lib/auth";
import Image from "next/image";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Builds the public URL used to access a CV file.
 *
 * @param cvUrl - Absolute URL or relative file path returned by the backend.
 * @returns Full URL that can be opened or downloaded from the browser.
 */
function buildCvUrl(cvUrl: string) {
    if (cvUrl.startsWith("http")) {
        return cvUrl;
    }

    return `${FILE_BASE_URL}/files/${cvUrl}`;
}

type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";

type StudentProfile = {
    firstName: string;
    lastName: string;
    originInstitution: string;
    proposedThesisTitle: string;
    motivation: string;
    hasFunding: boolean;
    fundingType: string | null;
    fundingDurationMonths: number | null;
    willingToRelocateToMadrid: boolean;
    dedicationType: string;
    additionalInformation: string | null;
    cvUrl: string;
    doctoralPrograms?: string[];
    researchLines?: string[];
};

type SupervisedThesis = {
    id: number;
    doctoralStudentName: string;
    thesisTitle: string;
    defenseYear: number | null;
    researchDescription: string;
    industrialMention: boolean;
    internationalMention: boolean;
    results: string | null;
    ongoing: boolean;
};

type ProfessorProfile = {
    firstName: string;
    lastName: string;
    institution: string;
    department: string | null;
    availableToSupervise: boolean;
    maxPhdStudents: number | null;
    additionalInformation: string | null;
    cvUrl: string;
    doctoralPrograms?: string[];
    researchLines?: string[];
    supervisedTheses?: SupervisedThesis[];
};

type AdminUserDetail = {
    id: number;
    email: string;
    role: UserRole;
    active: boolean;
    fullName: string;
    studentProfile: StudentProfile | null;
    professorProfile: ProfessorProfile | null;
};

/**
 * Converts an internal user role into the label displayed in the administration interface.
 *
 * @param role - Internal role assigned to the user.
 * @returns Readable role name for the UI.
 */
function roleLabel(role: UserRole) {
    if (role === "STUDENT") return "Estudiante";
    if (role === "PROFESSOR") return "Profesor";
    return "Administrador";
}

/**
 * Administration user detail page.
 *
 * Allows an administrator to inspect the complete information of a registered user,
 * including account metadata, student profile information, professor profile
 * information, associated research lines, doctoral programs, supervised theses and CV.
 */
export default function AdminUserDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingIdentity, setEditingIdentity] = useState(false);
    const [identityFirstName, setIdentityFirstName] = useState("");
    const [identityLastName, setIdentityLastName] = useState("");
    const [identityEmail, setIdentityEmail] = useState("");
    const [savingIdentity, setSavingIdentity] = useState(false);

    /**
     * Ensures that only authenticated administrators can access the detail page.
     * If the current user is not allowed to view this area, the page redirects
     * to the corresponding safe route.
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

        if (user.role !== "ADMIN") {
            router.replace("/dashboard");
            return;
        }

        loadUser();
    }, [router, params.id]);

    /**
     * Loads the detailed information of the selected user from the backend.
     *
     * If the session is no longer authorized, the local session is removed and
     * the administrator is redirected to the login page.
     */
    async function loadUser() {
        setLoading(true);
        setError("");

        try {
            const data = await apiFetch<AdminUserDetail>(`/admin/users/${params.id}`);
            setUserDetail(data);
        } catch (err) {
            if (err instanceof Error) {
                if (
                    err.message.includes("Error 403") ||
                    err.message.includes("Forbidden")
                ) {
                    clearSession();
                    router.replace("/login");
                    return;
                }
                setError(err.message);
            } else {
                setError("No se ha podido cargar el detalle del usuario.");
            }
        } finally {
            setLoading(false);
        }
    }

    function openIdentityEditor() {
        if (!userDetail) return;

        const firstName =
            userDetail.studentProfile?.firstName ||
            userDetail.professorProfile?.firstName ||
            "";

        const lastName =
            userDetail.studentProfile?.lastName ||
            userDetail.professorProfile?.lastName ||
            "";

        setIdentityFirstName(firstName);
        setIdentityLastName(lastName);
        setIdentityEmail(userDetail.email);
        setEditingIdentity(true);
    }

    async function handleSaveIdentity() {
        if (!userDetail) return;

        setSavingIdentity(true);
        setError("");

        try {
            await apiFetch(`/admin/users/${userDetail.id}/identity`, {
                method: "PUT",
                body: JSON.stringify({
                    firstName: identityFirstName.trim(),
                    lastName: identityLastName.trim(),
                    email: identityEmail.trim(),
                }),
            });

            await loadUser();
            setEditingIdentity(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se han podido actualizar los datos.");
        } finally {
            setSavingIdentity(false);
        }
    }

    /**
     * Downloads a CV file from its public URL and saves it using the provided filename.
     *
     * @param url - Public URL of the CV file.
     * @param filename - Name used by the browser when downloading the file.
     */
    async function handleDownloadCv(url: string, filename: string) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("No se ha podido descargar el CV.");
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "No se ha podido descargar el CV."
            );
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/70">
                    Cargando detalle...
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Image
                        src="/thesismatch-logo.jpeg"
                        alt="Logo ThesisMatch"
                        width={150}
                        height={150}
                        className="rounded-lg"
                    />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                            Área de administración
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                            Detalle de usuario
                        </h1>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                >
                    Cerrar sesión
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {userDetail && (
                <div className="space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">
                    <div className="space-y-2">
                        <p>
                            <strong>Nombre completo:</strong> {userDetail.fullName}
                        </p>
                        <p>
                            <strong>Email:</strong> {userDetail.email}
                        </p>
                        <p>
                            <strong>Rol:</strong> {roleLabel(userDetail.role)}
                        </p>
                        <p>
                            <strong>Activa:</strong> {userDetail.active ? "Sí" : "No"}
                        </p>

                        <button
                            type="button"
                            onClick={openIdentityEditor}
                            className="mt-3 rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                        >
                            Editar nombre, apellidos y correo
                        </button>


                    </div>

                    {userDetail.studentProfile && (
                        <div className="space-y-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <h2 className="text-xl font-semibold">Perfil de estudiante</h2>

                            <p>
                                <strong>Nombre:</strong> {userDetail.studentProfile.firstName}
                            </p>
                            <p>
                                <strong>Apellidos:</strong> {userDetail.studentProfile.lastName}
                            </p>
                            <p>
                                <strong>Institución de origen:</strong>{" "}
                                {userDetail.studentProfile.originInstitution}
                            </p>
                            <p>
                                <strong>Título propuesto:</strong>{" "}
                                {userDetail.studentProfile.proposedThesisTitle}
                            </p>
                            <p>
                                <strong>Motivación:</strong>{" "}
                                {userDetail.studentProfile.motivation}
                            </p>

                            <div>
                                <strong>CV:</strong>{" "}
                                {userDetail.studentProfile.cvUrl ? (
                                    <div className="mt-2 flex gap-4">
                                        <a
                                            href={buildCvUrl(userDetail.studentProfile.cvUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Ver CV
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownloadCv(
                                                    buildCvUrl(userDetail.studentProfile!.cvUrl),
                                                    "cv_estudiante.pdf"
                                                )
                                            }
                                            className="text-green-600 underline"
                                        >
                                            Descargar CV
                                        </button>
                                    </div>
                                ) : (
                                    "No disponible"
                                )}
                            </div>

                            <p>
                                <strong>Tipo de dedicación:</strong>{" "}
                                {userDetail.studentProfile.dedicationType}
                            </p>
                            <p>
                                <strong>Financiación:</strong>{" "}
                                {userDetail.studentProfile.hasFunding ? "Sí" : "No"}
                            </p>
                            <p>
                                <strong>Tipo de financiación:</strong>{" "}
                                {userDetail.studentProfile.fundingType || "-"}
                            </p>
                            <p>
                                <strong>Duración financiación:</strong>{" "}
                                {userDetail.studentProfile.fundingDurationMonths ?? "-"}
                            </p>
                            <p>
                                <strong>Traslado a Madrid:</strong>{" "}
                                {userDetail.studentProfile.willingToRelocateToMadrid
                                    ? "Sí"
                                    : "No"}
                            </p>
                            <p>
                                <strong>Información adicional:</strong>{" "}
                                {userDetail.studentProfile.additionalInformation || "-"}
                            </p>

                            <div>
                                <strong>Programas de doctorado:</strong>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(userDetail.studentProfile.doctoralPrograms || []).length >
                                        0 ? (
                                        (userDetail.studentProfile.doctoralPrograms || []).map(
                                            (program) => (
                                                <span
                                                    key={program}
                                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                                >
                                                    {program}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-500">No disponibles</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong>Líneas de investigación:</strong>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(userDetail.studentProfile.researchLines || []).length > 0 ? (
                                        (userDetail.studentProfile.researchLines || []).map(
                                            (line) => (
                                                <span
                                                    key={line}
                                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                                >
                                                    {line}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-500">No disponibles</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {userDetail.professorProfile && (
                        <div className="space-y-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <h2 className="text-xl font-semibold">Perfil de profesor</h2>

                            <p>
                                <strong>Nombre:</strong> {userDetail.professorProfile.firstName}
                            </p>
                            <p>
                                <strong>Apellidos:</strong> {userDetail.professorProfile.lastName}
                            </p>
                            <p>
                                <strong>Institución:</strong>{" "}
                                {userDetail.professorProfile.institution}
                            </p>
                            <p>
                                <strong>Departamento:</strong>{" "}
                                {userDetail.professorProfile.department || "-"}
                            </p>
                            <p>
                                <strong>Disponible para dirigir:</strong>{" "}
                                {userDetail.professorProfile.availableToSupervise ? "Sí" : "No"}
                            </p>
                            <p>
                                <strong>Máx. doctorandos:</strong>{" "}
                                {userDetail.professorProfile.maxPhdStudents ?? "-"}
                            </p>

                            <div>
                                <strong>CV:</strong>{" "}
                                {userDetail.professorProfile.cvUrl ? (
                                    <div className="mt-2 flex gap-4">
                                        <a
                                            href={buildCvUrl(userDetail.professorProfile.cvUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Ver CV
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownloadCv(
                                                    buildCvUrl(userDetail.professorProfile!.cvUrl),
                                                    "cv_profesor.pdf"
                                                )
                                            }
                                            className="text-green-600 underline"
                                        >
                                            Descargar CV
                                        </button>
                                    </div>
                                ) : (
                                    "No disponible"
                                )}
                            </div>

                            <p>
                                <strong>Información adicional:</strong>{" "}
                                {userDetail.professorProfile.additionalInformation || "-"}
                            </p>

                            <div>
                                <strong>Programas de doctorado:</strong>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(userDetail.professorProfile.doctoralPrograms || []).length >
                                        0 ? (
                                        (userDetail.professorProfile.doctoralPrograms || []).map(
                                            (program) => (
                                                <span
                                                    key={program}
                                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                                >
                                                    {program}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-500">No disponibles</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong>Líneas de investigación:</strong>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(userDetail.professorProfile.researchLines || []).length >
                                        0 ? (
                                        (userDetail.professorProfile.researchLines || []).map(
                                            (line) => (
                                                <span
                                                    key={line}
                                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                                >
                                                    {line}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-500">No disponibles</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <strong>Tesis dirigidas previamente o en curso:</strong>
                                <div className="mt-2 space-y-3">
                                    {(userDetail.professorProfile.supervisedTheses || []).length > 0 ? (
                                        userDetail.professorProfile.supervisedTheses!.map((thesis) => (
                                            <div key={thesis.id} className="rounded-xl border p-3">
                                                <p><strong>Título:</strong> {thesis.thesisTitle}</p>
                                                <p><strong>Doctorando:</strong> {thesis.doctoralStudentName}</p>
                                                <p><strong>Año:</strong> {thesis.defenseYear ?? "No indicado"}</p>
                                                <p><strong>Investigación:</strong> {thesis.researchDescription}</p>
                                                <p><strong>Resultados:</strong> {thesis.results || "No indicados"}</p>
                                                <p>
                                                    <strong>Menciones:</strong>{" "}
                                                    {thesis.industrialMention ? "Industrial " : ""}
                                                    {thesis.internationalMention ? "Internacional " : ""}
                                                    {!thesis.industrialMention && !thesis.internationalMention
                                                        ? "Sin menciones"
                                                        : ""}
                                                </p>
                                                <p>
                                                    <strong>Estado:</strong>{" "}
                                                    {thesis.ongoing ? "En curso" : "Finalizada"}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            No hay tesis registradas
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Volver
                    </button>
                </div>
            )}

            {editingIdentity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                Editar datos de cuenta
                            </h2>

                            <button
                                onClick={() => setEditingIdentity(false)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="grid gap-4">
                            <input
                                value={identityFirstName}
                                onChange={(e) => setIdentityFirstName(e.target.value)}
                                placeholder="Nombre"
                                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400"
                            />

                            <input
                                value={identityLastName}
                                onChange={(e) => setIdentityLastName(e.target.value)}
                                placeholder="Apellidos"
                                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400"
                            />

                            <input
                                value={identityEmail}
                                onChange={(e) => setIdentityEmail(e.target.value)}
                                placeholder="Correo electrónico"
                                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400"
                            />

                            <button
                                type="button"
                                onClick={handleSaveIdentity}
                                disabled={
                                    savingIdentity ||
                                    !identityFirstName.trim() ||
                                    !identityLastName.trim() ||
                                    !identityEmail.trim()
                                }
                                className="rounded-2xl border border-white bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {savingIdentity ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}