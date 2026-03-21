"use client";

import { useRouter } from "next/navigation";

export default function StudentRequestsPage() {
    const router = useRouter();

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm text-gray-500">Área de estudiante</p>
                <h1 className="text-3xl font-bold">Solicitudes</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold">Solicitudes enviadas</h2>
                    <p className="text-sm text-gray-600">
                        Aquí aparecerán las solicitudes que has enviado a profesores.
                    </p>
                </div>

                <div className="rounded-2xl border p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold">Solicitudes recibidas</h2>
                    <p className="text-sm text-gray-600">
                        Aquí aparecerán las solicitudes que hayas recibido.
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => router.push("/student/dashboard")}
                    className="rounded-xl border px-5 py-3 font-medium"
                >
                    Volver
                </button>
            </div>
        </main>
    );
}