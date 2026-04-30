"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";

/**
 * Generic dashboard routing page.
 *
 * Acts as an intermediate protected route that redirects each authenticated user
 * to the dashboard that corresponds to their role.
 */
export default function DashboardPage() {
    const router = useRouter();

    /**
     * Checks the current authentication state and redirects the user according
     * to their assigned role.
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

        if (user.role === "STUDENT") {
            router.replace("/student/dashboard");
            return;
        }

        if (user.role === "PROFESSOR") {
            router.replace("/professor/dashboard");
            return;
        }

        if (user.role === "ADMIN") {
            router.replace("/admin/dashboard");
            return;
        }
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center px-6">
            <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/70">
                Redirigiendo...
            </div>
        </main>
    );
}