"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";

export default function DashboardPage() {
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