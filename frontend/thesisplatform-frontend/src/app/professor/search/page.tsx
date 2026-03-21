"use client";

import { useRouter } from "next/navigation";

export default function ProfessorSearchPage() {
    const router = useRouter();

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
            <h1 className="mb-4 text-3xl font-bold">Búsqueda de estudiantes</h1>
            <p className="mb-6 text-gray-600">
                Aquí irá la búsqueda manual y el acceso a matches del profesor.
            </p>

            <button
                onClick={() => router.push("/professor/dashboard")}
                className="rounded-xl border px-5 py-3 font-medium"
            >
                Volver
            </button>
        </main>
    );
}