import axios from 'axios';

// Create axios instance for API calls
export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Store interceptor ID so we can eject it later
let requestInterceptorId: number | null = null;

// Setup axios interceptor to add JWT token to all requests
export const setupAxiosInterceptors = (token: string) => {
    // Eject previous interceptor if exists
    if (requestInterceptorId !== null) {
        apiClient.interceptors.request.eject(requestInterceptorId);
    }

    // Add new interceptor
    requestInterceptorId = apiClient.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
};

// Clear axios interceptor (remove JWT token)
export const clearAxiosInterceptors = () => {
    if (requestInterceptorId !== null) {
        apiClient.interceptors.request.eject(requestInterceptorId);
        requestInterceptorId = null;
    }
};
