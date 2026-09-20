import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import loginBg from '../assets/img/login.jpg';
import './Login.css';

interface LoginProps {
    onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit,
    } = useLogin();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        await handleSubmit(e, onLoginSuccess);
    };

    return (
        <div
            className="login-body"
            style={
                {
                    '--login-bg-image': `url(${loginBg})`,
                } as React.CSSProperties
            }
        >
            <div className="container vh-100 d-flex align-items-center justify-content-center">
                <div className="card login-card shadow">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <i className="fas fa-seedling fa-3x text-primary mb-3"></i>
                            <h2 className="card-title">Disagro</h2>
                            <p className="text-muted">Acceso administrativo</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                {error}
                            </div>
                        )}

                        <form id="formLogin" onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    <i className="fas fa-envelope me-2"></i>Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="admin@disagro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    <i className="fas fa-lock me-2"></i>Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="d-grid">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Verificando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt me-2"></i> Ingresar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 text-center">
                            <Link to="/" className="text-decoration-none">
                                <small>← Volver al formulario del evento</small>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
