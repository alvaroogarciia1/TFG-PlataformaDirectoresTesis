"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import Image from "next/image";

/**
 * Professor dashboard page.
 *
 * Provides the main navigation area for professor users, allowing access to
 * profile management, thesis supervision requests and student search features.
 */
export default function ProfessorDashboardPage() {
    const router = useRouter();

    /**
     * Ensures that only authenticated professor users can access this dashboard.
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

        if (user.role !== "PROFESSOR") {
            router.replace("/dashboard");
        }
    }, [router]);

    return (
        <main className="min-h-screen px-6 py-10">
            <section className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                                Área de profesor
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                Dashboard
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

                {/* Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <DashboardCard
                        title="Modificar perfil"
                        description="Consulta y actualiza toda la información de tu perfil académico."
                        onClick={() => router.push("/professor/profile")}
                    />

                    <DashboardCard
                        title="Solicitudes"
                        description="Gestiona las solicitudes recibidas de estudiantes."
                        onClick={() => router.push("/professor/requests")}
                    />

                    <DashboardCard
                        title="Búsqueda"
                        description="Encuentra estudiantes compatibles según tus líneas de investigación."
                        onClick={() => router.push("/professor/search")}
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