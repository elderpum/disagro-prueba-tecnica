const getApiUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = envUrl.replace(/\/$/, '');
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export const API_URL = getApiUrl();

if (!import.meta.env.VITE_API_URL) {
    console.warn('VITE_API_URL no está definida en .env, usando valor por defecto:', API_URL);
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: AuthUser;
}

export interface LoginRequest {
    email: string;
    password: string;
}

class ApiService {
    private getAuthToken(): string | null {
        return localStorage.getItem('token');
    }

    getHeaders(includeAuth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async verifyToken(): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return await response.json();
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!this.getAuthToken();
    }

    getUser(): AuthUser | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

export const apiService = new ApiService();
