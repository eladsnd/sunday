import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { setupAxiosInterceptors } from '../api/authApi';

export default function AuthCallback() {
    const { login } = useAuth();

    useEffect(() => {
        // Get token and user from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Save to localStorage
                localStorage.setItem('authToken', token);
                localStorage.setItem('authUser', JSON.stringify(user));

                setupAxiosInterceptors(token);

                // Redirect to main app
                window.location.href = '/';
            } catch (error) {
                console.error('Error parsing auth callback:', error);
                window.location.href = '/login';
            }
        } else {
            window.location.href = '/login';
        }
    }, []);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Completing authentication...</h1>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        </div>
    );
}
