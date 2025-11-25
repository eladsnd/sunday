import axios from 'axios';

// Create axios instance for API calls
export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Setup axios interceptor to add JWT token to all requests
export const setupAxiosInterceptors = (token: string) => {
    apiClient.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
};
