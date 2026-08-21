import api from "../api/axios";

export interface Outpass {
    id: number;
    reason: string;
    outpassType: string;
    status:
        | "PENDING"
        | "PARENT_APPROVED"
        | "WARDEN_APPROVED"
        | "REJECTED"
        | "OUT"
        | "IN"
        | "CANCELLED";
    outTime: string;
    expectedInTime: string;
    actualInTime: string | null;
    destination: string;
}

export type ResendRecipient = "PARENT" | "WARDEN";

export interface ResendEmailResponse {
    message: string;
    recipient: ResendRecipient;
    resendCount: number;
    remainingAttempts: number;
}

export const outpassService = {

    /**
     * Get all outpasses belonging to the authenticated student.
     */
    getAllOutpasses: async (): Promise<Outpass[]> => {
        const response = await api.get(
            "/outpass-service/student/outpasses/all"
        );

        return response.data;
    },

    /**
     * Create a new outpass.
     */
    createOutpass: async (
        data: Partial<Outpass>
    ): Promise<Outpass> => {
        const response = await api.post(
            "/outpass-service/student/apply",
            data
        );

        return response.data;
    },

    /**
     * Resend outpass email to parent or warden.
     *
     * The backend determines:
     * - whether the user is authenticated
     * - whether the outpass belongs to the student
     * - whether the resend limit has been reached
     * - the current resend count
     * - remaining attempts
     */
    resendEmail: async (
        outpassId: number,
        recipient: ResendRecipient
    ): Promise<ResendEmailResponse> => {

        const response = await api.post(
            `/outpass-service/student/outpasses/${outpassId}/resend-email`,
            {
                recipient,
            }
        );

        return response.data;
    },
};