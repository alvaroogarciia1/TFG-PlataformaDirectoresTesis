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
    }, [router]);

    return (
        <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
            <p>Redirigiendo...</p>
        </main>
    );
}