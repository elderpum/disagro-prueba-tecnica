import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { AuthUser, LoginResponse } from '../services/api';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (apiService.isAuthenticated()) {
                try {
                    const response: LoginResponse = await apiService.verifyToken();
                    if (response.success && response.user) {
                        setIsAuthenticated(true);
                        setUser(response.user);
                    } else {
                        apiService.logout();
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    apiService.logout();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData: AuthUser) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        apiService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return {
        isAuthenticated,
        loading,
        user,
        login,
        logout,
    };
}
