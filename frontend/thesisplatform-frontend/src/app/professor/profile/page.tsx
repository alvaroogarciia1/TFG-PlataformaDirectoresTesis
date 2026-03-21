"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout, clearSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function ProfessorProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
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
                const data = await apiFetch("/professors/me");
                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("Professor profile not found")) {
                        router.replace("/professor/profile/setup");
                        return;
                    }

                    if (
                        err.message.includes("Forbidden") ||
                        err.message.includes("Error 403")
                    ) {
                        clearSession();
                        router.replace("/login");
                        return;
                    }

                    setError(err.message);
                } else {
                    setError("No se ha podido cargar el perfil");
                }
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [router]);

    if (loading) {
        return (
            <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
                <p>Cargando perfil...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Área de profesor</p>
                    <h1 className="text-3xl font-bold">Modificar perfil</h1>
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

            {profile && (
                <div className="space-y-6 rounded-2xl border p-6 shadow-sm">
                    <div className="space-y-2">
                        <p><strong>Nombre:</strong> {profile.firstName}</p>
                        <p><strong>Apellidos:</strong> {profile.lastName}</p>
                        <p><strong>Institución:</strong> {profile.institution}</p>
                        <p><strong>Departamento:</strong> {profile.department || "-"}</p>
                        <p><strong>Disponible para dirigir:</strong> {profile.availableToSupervise ? "Sí" : "No"}</p>
                        <p><strong>Máx. doctorandos:</strong> {profile.maxPhdStudents ?? "-"}</p>
                        <p><strong>CV:</strong> {profile.cvUrl}</p>
                        <p><strong>Información adicional:</strong> {profile.additionalInformation || "-"}</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/professor/dashboard")}
                            className="rounded-xl border px-5 py-3 font-medium"
                        >
                            Volver
                        </button>

                        <button
                            onClick={() => router.push("/professor/profile/setup")}
                            className="rounded-xl border px-5 py-3 font-medium"
                        >
                            Editar perfil
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}