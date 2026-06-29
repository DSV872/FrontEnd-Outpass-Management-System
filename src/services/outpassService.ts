import api from './api';

export interface Outpass {
    id?: number;
    studentId: number;
    reason: string;
    destination?: string;
    fromDate?: string;
    toDate?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export const outpassService = {
    // Keeping this for compatibility although we might need to change it depending on role
    getAllOutpasses: async (): Promise<Outpass[]> => {
        const response = await api.get('/outpass-service/outpasses');
        return response.data;
    },

    createOutpass: async (data: Partial<Outpass>): Promise<Outpass> => {
        const response = await api.post('/outpass-service/student/apply', data);
        return response.data;
    }
};
