"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearSession, getUser, isAuthenticated, logout } from "@/lib/auth";

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

function roleLabel(role: UserRole) {
    if (role === "STUDENT") return "Estudiante";
    if (role === "PROFESSOR") return "Profesor";
    return "Administrador";
}

export default function AdminUserDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
                <p>Cargando detalle...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Área de administración</p>
                    <h1 className="text-3xl font-bold">Detalle de usuario</h1>
                </div>

                <button
                    onClick={logout}
                    className="rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50"
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
                <div className="space-y-6 rounded-2xl border p-6 shadow-sm">
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
                    </div>

                    {userDetail.studentProfile && (
                        <div className="space-y-2 rounded-xl border p-4">
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
                                            href={userDetail.studentProfile.cvUrl}
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
                                                    userDetail.studentProfile!.cvUrl,
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
                                                    className="rounded-full border px-3 py-1 text-sm"
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
                                                    className="rounded-full border px-3 py-1 text-sm"
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
                        <div className="space-y-2 rounded-xl border p-4">
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
                                            href={userDetail.professorProfile.cvUrl}
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
                                                    userDetail.professorProfile!.cvUrl,
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
                                                    className="rounded-full border px-3 py-1 text-sm"
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
                                                    className="rounded-full border px-3 py-1 text-sm"
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

                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="rounded-xl border px-5 py-3 font-medium"
                    >
                        Volver
                    </button>
                </div>
            )}
        </main>
    );
}