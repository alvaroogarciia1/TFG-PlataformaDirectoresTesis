"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { RegisterResponse, UserRole } from "@/types/auth";

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("STUDENT");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiFetch<RegisterResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    role,
                }),
            });

            router.push("/?registered=true");
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("el tamaño debe estar entre 6 y 100")) {
                    setError("La contraseña debe tener entre 6 y 100 caracteres.");
                } else if (err.message.includes("already exists")) {
                    setError("Ya existe una cuenta registrada con ese correo.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("No se ha podido completar el registro");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
            <div className="w-full rounded-2xl border p-6 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Regístrate como estudiante o profesor.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Correo</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Rol</label>
                        <select
                            className="w-full rounded-xl border px-3 py-2"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                        >
                            <option value="STUDENT">Estudiante</option>
                            <option value="PROFESSOR">Profesor</option>
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:opacity-60"
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
            </div>
        </main>
    );
}