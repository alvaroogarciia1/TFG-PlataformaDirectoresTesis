export type ThesisRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type RequestInitiator = "STUDENT" | "PROFESSOR";

export interface ThesisRequest {
    id: number;

    studentUserId: number;
    studentEmail: string;
    studentFullName: string;

    professorUserId: number;
    professorEmail: string;
    professorFullName: string;

    subject: string;
    message: string;

    status: ThesisRequestStatus;
    initiator: RequestInitiator;

    createdAt: string;
    updatedAt: string;
}