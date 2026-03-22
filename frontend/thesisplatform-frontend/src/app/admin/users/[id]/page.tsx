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
                if (err.message.includes("Error 403") || err.message.includes("Forbidden")) {
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

            {loading && <p>Cargando detalle...</p>}

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {userDetail && (
                <div className="space-y-6 rounded-2xl border p-6 shadow-sm">
                    <div className="space-y-2">
                        <p><strong>Nombre:</strong> {userDetail.fullName}</p>
                        <p><strong>Email:</strong> {userDetail.email}</p>
                        <p><strong>Rol:</strong> {roleLabel(userDetail.role)}</p>
                        <p><strong>Activa:</strong> {userDetail.active ? "Sí" : "No"}</p>
                    </div>

                    {userDetail.studentProfile && (
                        <div className="space-y-2 rounded-xl border p-4">
                            <h2 className="text-xl font-semibold">Perfil de estudiante</h2>
                            <p><strong>Institución de origen:</strong> {userDetail.studentProfile.originInstitution}</p>
                            <p><strong>Título propuesto:</strong> {userDetail.studentProfile.proposedThesisTitle}</p>
                            <p><strong>Motivación:</strong> {userDetail.studentProfile.motivation}</p>
                            <p><strong>Financiación:</strong> {userDetail.studentProfile.hasFunding ? "Sí" : "No"}</p>
                            <p><strong>Tipo de financiación:</strong> {userDetail.studentProfile.fundingType || "-"}</p>
                            <p><strong>Duración financiación:</strong> {userDetail.studentProfile.fundingDurationMonths ?? "-"}</p>
                            <p><strong>Traslado a Madrid:</strong> {userDetail.studentProfile.willingToRelocateToMadrid ? "Sí" : "No"}</p>
                            <p><strong>Dedicación:</strong> {userDetail.studentProfile.dedicationType}</p>
                            <p><strong>CV:</strong> {userDetail.studentProfile.cvUrl}</p>
                        </div>
                    )}

                    {userDetail.professorProfile && (
                        <div className="space-y-2 rounded-xl border p-4">
                            <h2 className="text-xl font-semibold">Perfil de profesor</h2>
                            <p><strong>Institución:</strong> {userDetail.professorProfile.institution}</p>
                            <p><strong>Departamento:</strong> {userDetail.professorProfile.department || "-"}</p>
                            <p><strong>Disponible para dirigir:</strong> {userDetail.professorProfile.availableToSupervise ? "Sí" : "No"}</p>
                            <p><strong>Máx. doctorandos:</strong> {userDetail.professorProfile.maxPhdStudents ?? "-"}</p>
                            <p><strong>CV:</strong> {userDetail.professorProfile.cvUrl}</p>
                            <p><strong>Información adicional:</strong> {userDetail.professorProfile.additionalInformation || "-"}</p>
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