import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    email: string;
    role: 'STUDENT' | 'PARENT' | 'WARDEN' | 'SECURITY' | 'ADMIN';
    rawToken: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    const decoded = jwtDecode<any>(storedToken);

                    const currentTime = Date.now() / 1000;

                    if (decoded.exp && decoded.exp < currentTime) {

                        localStorage.removeItem("token");
                        setUser(null);
                    } else {
                        const role =
                            decoded.role ||
                            decoded.authorities?.[0]?.authority ||
                            "STUDENT";

                        setUser({
                            id: decoded.sub || decoded.id,
                            email: decoded.email || decoded.sub || "",
                            role,
                            rawToken: storedToken
                        });
                    }
                } catch (error) {
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (token: string) => {
        try {
            const decoded = jwtDecode<any>(token);
            localStorage.setItem('token', token);

            const role = decoded.role || decoded.authorities?.[0]?.authority || 'STUDENT';

            setUser({
                id: decoded.sub || decoded.id,
                email: decoded.email || decoded.sub || '',
                role: role as any,
                rawToken: token,
            });
        } catch (e) {
            console.error('[AuthContext] Login failed to decode token:', e);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
