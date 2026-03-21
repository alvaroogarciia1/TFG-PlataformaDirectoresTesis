"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout } from "@/lib/auth";

export default function ProfessorDashboardPage() {
    const router = useRouter();

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

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Área de profesor</p>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>

                <button
                    onClick={logout}
                    className="rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50"
                >
                    Cerrar sesión
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <button
                    onClick={() => router.push("/professor/profile")}
                    className="rounded-2xl border p-6 text-left shadow-sm transition hover:bg-gray-50"
                >
                    <h2 className="mb-2 text-xl font-semibold">Modificar perfil</h2>
                    <p className="text-sm text-gray-600">
                        Consulta y actualiza toda la información de tu perfil.
                    </p>
                </button>

                <button
                    onClick={() => router.push("/professor/requests")}
                    className="rounded-2xl border p-6 text-left shadow-sm transition hover:bg-gray-50"
                >
                    <h2 className="mb-2 text-xl font-semibold">Solicitudes</h2>
                    <p className="text-sm text-gray-600">
                        Consulta tus solicitudes enviadas y las solicitudes recibidas.
                    </p>
                </button>

                <button
                    onClick={() => router.push("/professor/search")}
                    className="rounded-2xl border p-6 text-left shadow-sm transition hover:bg-gray-50"
                >
                    <h2 className="mb-2 text-xl font-semibold">Búsqueda</h2>
                    <p className="text-sm text-gray-600">
                        Busca estudiantes compatibles y revisa tus matches.
                    </p>
                </button>
            </div>
        </main>
    );
}