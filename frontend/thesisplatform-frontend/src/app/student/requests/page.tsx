"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getSentRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
} from "@/lib/requests";
import { ThesisRequest } from "@/types/requests";

type RequestWithDirection = ThesisRequest & {
    direction: "sent" | "received";
};

function formatStatus(status: ThesisRequest["status"]) {
    switch (status) {
        case "PENDING":
            return "Pendiente";
        case "ACCEPTED":
            return "Aceptada";
        case "REJECTED":
            return "Rechazada";
        case "CANCELLED":
            return "Cancelada";
        default:
            return status;
    }
}

export default function StudentRequestsPage() {
    const router = useRouter();

    const [sent, setSent] = useState<ThesisRequest[]>([]);
    const [received, setReceived] = useState<ThesisRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RequestWithDirection | null>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [sentData, receivedData] = await Promise.all([
                getSentRequests(),
                getReceivedRequests(),
            ]);

            setSent(sentData);
            setReceived(receivedData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const allRequests = useMemo<RequestWithDirection[]>(() => {
        return [
            ...sent.map((req) => ({ ...req, direction: "sent" as const })),
            ...received.map((req) => ({ ...req, direction: "received" as const })),
        ].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [sent, received]);

    async function handleAccept(id: number) {
        await acceptRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    async function handleReject(id: number) {
        await rejectRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    async function handleCancel(id: number) {
        await cancelRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-white">
            <div className="mb-8 flex items-start gap-4">
                <button
                    onClick={() => router.push("/student/dashboard")}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white text-2xl transition hover:bg-white/10"
                >
                    ←
                </button>

                <div className="flex-1">
                    <h1 className="mb-3 text-3xl font-bold">Solicitudes</h1>
                    <p className="max-w-4xl text-lg italic text-gray-300">
                        Aquí puedes consultar tus solicitudes enviadas y recibidas, revisar su detalle
                        y gestionar las que estén pendientes.
                    </p>
                </div>
            </div>

            <section className="overflow-hidden rounded-[2rem] border border-white bg-transparent">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                Tipo
                            </th>
                            <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                Profesor
                            </th>
                            <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                Asunto
                            </th>
                            <th className="border-b border-r border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                Estado
                            </th>
                            <th className="border-b border-white px-4 py-5 text-left text-lg font-semibold text-white">
                                Detalle
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center text-lg text-gray-400">
                                    Cargando...
                                </td>
                            </tr>
                        ) : allRequests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center text-lg text-gray-400">
                                    No hay solicitudes.
                                </td>
                            </tr>
                        ) : (
                            allRequests.map((req) => (
                                <tr key={`${req.direction}-${req.id}`} className="border-t border-white">
                                    <td className="border-r border-white px-4 py-5">
                                        {req.direction === "sent" ? "Enviada" : "Recibida"}
                                    </td>
                                    <td className="border-r border-white px-4 py-5">
                                        {req.professorFullName}
                                    </td>
                                    <td className="border-r border-white px-4 py-5">
                                        {req.subject}
                                    </td>
                                    <td className="border-r border-white px-4 py-5">
                                        {formatStatus(req.status)}
                                    </td>
                                    <td className="px-4 py-5">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
                                        >
                                            Ver detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-black p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Detalle de solicitud</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="grid gap-3 text-white">
                            <p><b>Tipo:</b> {selectedRequest.direction === "sent" ? "Enviada" : "Recibida"}</p>
                            <p><b>Profesor:</b> {selectedRequest.professorFullName}</p>
                            <p><b>Email profesor:</b> {selectedRequest.professorEmail}</p>
                            <p><b>Asunto:</b> {selectedRequest.subject}</p>
                            <p><b>Estado:</b> {formatStatus(selectedRequest.status)}</p>
                            <p><b>Mensaje:</b> {selectedRequest.message}</p>
                            <p><b>Fecha:</b> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {selectedRequest.status === "PENDING" && selectedRequest.direction === "received" && (
                                <>
                                    <button
                                        onClick={() => handleAccept(selectedRequest.id)}
                                        className="rounded-xl border border-white bg-white px-5 py-2 text-black transition hover:bg-gray-200"
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest.id)}
                                        className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
                                    >
                                        Rechazar
                                    </button>
                                </>
                            )}

                            {selectedRequest.status === "PENDING" && selectedRequest.direction === "sent" && (
                                <button
                                    onClick={() => handleCancel(selectedRequest.id)}
                                    className="rounded-xl border border-white px-5 py-2 text-white transition hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}