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
import Image from "next/image";

type RequestWithDirection = ThesisRequest & {
    direction: "sent" | "received";
};

/**
 * Converts the internal request status into the label shown in the interface.
 *
 * @param status - Current status of the thesis request.
 * @returns Readable status label.
 */
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

/**
 * Professor requests page.
 *
 * Displays both sent and received thesis supervision requests for the professor.
 * The page allows the professor to review request details and manage pending
 * requests by accepting, rejecting or cancelling them depending on their direction.
 */
export default function ProfessorRequestsPage() {
    const router = useRouter();

    const [sent, setSent] = useState<ThesisRequest[]>([]);
    const [received, setReceived] = useState<ThesisRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RequestWithDirection | null>(null);

    /**
     * Loads sent and received requests in parallel and updates the page state.
     */
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

    /**
     * Loads the initial request data when the page is mounted.
     */
    useEffect(() => {
        loadData();
    }, []);

    /**
     * Combines sent and received requests into a single chronologically ordered list.
     */
    const allRequests = useMemo<RequestWithDirection[]>(() => {
        return [
            ...sent.map((req) => ({ ...req, direction: "sent" as const })),
            ...received.map((req) => ({ ...req, direction: "received" as const })),
        ].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [sent, received]);

    /**
     * Accepts a pending received request and refreshes the table.
     *
     * @param id - Identifier of the request to accept.
     */
    async function handleAccept(id: number) {
        await acceptRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    /**
     * Rejects a pending received request and refreshes the table.
     *
     * @param id - Identifier of the request to reject.
     */
    async function handleReject(id: number) {
        await rejectRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    /**
     * Cancels a pending sent request and refreshes the table.
     *
     * @param id - Identifier of the request to cancel.
     */
    async function handleCancel(id: number) {
        await cancelRequest(id);
        await loadData();
        setSelectedRequest(null);
    }

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-slate-900">
            <div className="mb-10 flex items-start gap-4">
                <button
                    onClick={() => router.push("/professor/dashboard")}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                >
                    ←
                </button>

                <div className="flex gap-4">
                    <Image
                        src="/thesismatch-logo.jpeg"
                        alt="Logo ThesisMatch"
                        width={150}
                        height={150}
                        className="hidden rounded-xl sm:block"
                    />

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                            Área de profesor
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                            Solicitudes
                        </h1>
                        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
                            Consulta tus solicitudes enviadas y recibidas, revisa su detalle y gestiona las que estén pendientes.
                        </p>
                    </div>
                </div>
            </div>

            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                Tipo
                            </th>
                            <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                Estudiante
                            </th>
                            <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                Asunto
                            </th>
                            <th className="border-b border-r border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
                                Estado
                            </th>
                            <th className="border-b border-gray-300 px-4 py-5 text-left text-lg font-semibold text-gray-900">
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
                                <tr key={`${req.direction}-${req.id}`} className="border-t border-gray-300">
                                    <td className="border-r border-gray-300 px-4 py-5">
                                        {req.direction === "sent" ? "Enviada" : "Recibida"}
                                    </td>
                                    <td className="border-r border-gray-300 px-4 py-5">
                                        {req.studentFullName}
                                    </td>
                                    <td className="border-r border-gray-300 px-4 py-5">
                                        {req.subject}
                                    </td>
                                    <td className="border-r border-gray-300 px-4 py-5">
                                        {formatStatus(req.status)}
                                    </td>
                                    <td className="px-4 py-5">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="rounded-xl border border-gray-400 px-5 py-2 text-gray-900 transition hover:bg-gray-100"
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
                            <h2 className="text-2xl font-bold text-white">Detalle de solicitud</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-xl border border-white px-4 py-2 text-white transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="grid gap-3 text-white">
                            <p><b>Tipo:</b> {selectedRequest.direction === "sent" ? "Enviada" : "Recibida"}</p>
                            <p><b>Estudiante:</b> {selectedRequest.studentFullName}</p>
                            <p><b>Email estudiante:</b> {selectedRequest.studentEmail}</p>
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