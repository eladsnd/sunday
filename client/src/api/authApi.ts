import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        profilePicture?: string;
    };
}

export const authApi = {
    register: (data: RegisterData) => axios.post<AuthResponse>(`${API_URL}/auth/register`, data),
    login: (data: LoginData) => axios.post<AuthResponse>(`${API_URL}/auth/login`, data),
    getProfile: (token: string) =>
        axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    googleLogin: () => {
        window.location.href = `${API_URL}/auth/google`;
    },
};

// Export axios interceptor functions from axios.config.ts
export { setupAxiosInterceptors, clearAxiosInterceptors } from './axios.config';
