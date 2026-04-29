"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import Image from "next/image";

/**
 * Student dashboard page.
 *
 * Provides the main navigation area for student users, allowing access to
 * profile management, thesis supervision requests and professor search features.
 */
export default function StudentDashboardPage() {
    const router = useRouter();

    /**
     * Ensures that only authenticated student users can access this dashboard.
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

    return (
        <main className="min-h-screen px-6 py-10">
            <section className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* IZQUIERDA (logo + textos) */}
                    <div className="flex items-center gap-3">
                        <Image
                            src="/thesismatch-logo.jpeg"
                            alt="Logo ThesisMatch"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                                Área de estudiante
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                Dashboard
                            </h1>
                        </div>
                    </div>

                    {/* DERECHA (botón logout) */}
                    <button
                        onClick={logout}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <DashboardCard
                        title="Modificar perfil"
                        description="Consulta y actualiza toda la información de tu perfil académico."
                        onClick={() => router.push("/student/profile")}
                    />

                    <DashboardCard
                        title="Solicitudes"
                        description="Consulta el estado de las solicitudes enviadas a profesores."
                        onClick={() => router.push("/student/requests")}
                    />

                    <DashboardCard
                        title="Búsqueda"
                        description="Encuentra profesores compatibles mediante búsqueda manual o automática."
                        onClick={() => router.push("/student/search")}
                    />
                </div>
            </section>
        </main>
    );
}

function DashboardCard({
    title,
    description,
    onClick,
}: {
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group rounded-[1.5rem] border border-white/70 bg-white/90 p-6 text-left shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
        >
            <h2 className="mb-2 text-lg font-bold text-slate-950 group-hover:text-blue-700">
                {title}
            </h2>
            <p className="text-sm leading-6 text-slate-600">
                {description}
            </p>
        </button>
    );
}