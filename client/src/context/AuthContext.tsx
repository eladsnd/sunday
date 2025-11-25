import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setupAxiosInterceptors } from '../api/authApi';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setupAxiosInterceptors(storedToken);
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { accessToken, user } = response.data;

        setToken(accessToken);
        setUser(user);

        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));

        setupAxiosInterceptors(accessToken);
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await authApi.register({ email, password, firstName, lastName });
        const { accessToken, user } = response.data;

        setToken(accessToken);
        setUser(user);

        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));

        setupAxiosInterceptors(accessToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!token,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
