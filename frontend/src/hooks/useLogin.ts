import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiService } from '../services/api';
import type { LoginRequest, LoginResponse } from '../services/api';

interface UseLoginReturn {
    email: string;
    password: string;
    loading: boolean;
    error: string;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>, onSuccess: () => void) => Promise<void>;
}

export function useLogin(): UseLoginReturn {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
        onSuccess: () => void
    ): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const credentials: LoginRequest = { email, password };
            const response: LoginResponse = await apiService.login(credentials);

            if (response.success && response.token) {
                onSuccess();
            } else {
                setError(response.message || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit,
    };
}
