"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getUser, isAuthenticated, logout, clearSession } from "@/lib/auth";

type UserRole = "STUDENT" | "PROFESSOR";

type AdminUserSummary = {
    id: number;
    email: string;
    role: UserRole;
    active: boolean;
    fullName: string;
};

type AdminUserSearchRequest = {
    query: string | null;
    role: UserRole | null;
    active: boolean | null;
};

function roleLabel(role: UserRole) {
    if (role === "STUDENT") return "Estudiante";
    if (role === "PROFESSOR") return "Profesor";
    return "Administrador";
}

export default function AdminDashboardPage() {
    const router = useRouter();

    const [users, setUsers] = useState<AdminUserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
    const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

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

        loadUsers();
    }, [router]);

    async function loadUsers() {
        setLoading(true);
        setError("");

        try {
            const body: AdminUserSearchRequest = {
                query: query.trim() || null,
                role: roleFilter || null,
                active:
                    activeFilter === ""
                        ? null
                        : activeFilter === "true",
            };

            const data = await apiFetch<AdminUserSummary[]>("/admin/users/search", {
                method: "POST",
                body: JSON.stringify(body),
            });

            setUsers(data);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("Error 403") || err.message.includes("Forbidden")) {
                    clearSession();
                    router.replace("/login");
                    return;
                }
                setError(err.message);
            } else {
                setError("No se ha podido cargar la lista de usuarios.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleActivate(id: number) {
        const confirmed = window.confirm("¿Seguro que quieres activar esta cuenta?");
        if (!confirmed) return;

        setActionLoadingId(id);
        setError("");

        try {
            await apiFetch(`/admin/users/${id}/activate`, {
                method: "PATCH",
            });
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se ha podido activar la cuenta.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleDeactivate(id: number) {
        const confirmed = window.confirm("¿Seguro que quieres desactivar esta cuenta?");
        if (!confirmed) return;

        setActionLoadingId(id);
        setError("");

        try {
            await apiFetch(`/admin/users/${id}/deactivate`, {
                method: "PATCH",
            });
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se ha podido desactivar la cuenta.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm("¿Seguro que quieres eliminar esta cuenta definitivamente?");
        if (!confirmed) return;

        setActionLoadingId(id);
        setError("");

        try {
            await apiFetch(`/admin/users/${id}`, {
                method: "DELETE",
            });
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se ha podido eliminar la cuenta.");
        } finally {
            setActionLoadingId(null);
        }
    }

    const emptyMessage = useMemo(() => {
        if (loading) return "";
        if (users.length === 0) return "No hay usuarios que coincidan con la búsqueda.";
        return "";
    }, [loading, users]);

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">Área de administración</p>
                    <h1 className="text-3xl font-bold">Dashboard admin</h1>
                </div>

                <button
                    onClick={logout}
                    className="rounded-xl border px-4 py-2 font-medium transition hover:bg-gray-50"
                >
                    Cerrar sesión
                </button>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Buscar usuario"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-w-[260px] flex-1 rounded-xl border px-4 py-3 outline-none"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as "" | UserRole)}
                    className="rounded-xl border px-4 py-3"
                >
                    <option value="">Todos los roles</option>
                    <option value="STUDENT">Estudiante</option>
                    <option value="PROFESSOR">Profesor</option>
                </select>

                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as "" | "true" | "false")}
                    className="rounded-xl border px-4 py-3"
                >
                    <option value="">Todas</option>
                    <option value="true">Activas</option>
                    <option value="false">Inactivas</option>
                </select>

                <button
                    onClick={loadUsers}
                    className="rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-50"
                >
                    Buscar
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-4 text-left text-sm font-semibold">Nombre y apellidos</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">Rol usuario</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">Perfil usuario</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">¿Cuenta activa?</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">Activar cuenta</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">Desactivar cuenta</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold">Eliminar cuenta</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-sm text-gray-500">
                                    Cargando usuarios...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-sm text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-4 py-4 text-sm">
                                        {user.fullName || user.email}
                                    </td>

                                    <td className="px-4 py-4 text-sm">
                                        {roleLabel(user.role)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => router.push(`/admin/users/${user.id}`)}
                                            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                                        >
                                            Ver perfil
                                        </button>
                                    </td>

                                    <td className="px-4 py-4 text-sm">
                                        {user.active ? "Sí" : "No"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleActivate(user.id)}
                                            disabled={actionLoadingId === user.id || user.active}
                                            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Activar
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleDeactivate(user.id)}
                                            disabled={actionLoadingId === user.id || !user.active}
                                            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Desactivar
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={actionLoadingId === user.id}
                                            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}