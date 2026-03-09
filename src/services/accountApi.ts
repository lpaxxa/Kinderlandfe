import { api } from './api';

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface ProfileUpdateRequest {
    firstName: string;
    lastName: string;
    phone: string;
}

export const accountApi = {
    getProfile: async (): Promise<{ data: UserResponse }> => {
        return await api.get('/api/v1/account/me');
    },

    updateProfile: async (data: ProfileUpdateRequest): Promise<any> => {
        return await api.post('/api/v1/account/update-profile', data);
    }
};
