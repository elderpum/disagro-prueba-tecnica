import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Sidebar from './components/Sidebar';
import ItemsList from './components/ItemsList';
import ItemForm from './components/ItemForm';
import ConfirmationsList from './components/ConfirmationsList';
import ConfirmationDetail from './components/ConfirmationDetail';
import ConfirmationForm from './components/ConfirmationForm';
import UsersList from './components/UsersList';
import UserForm from './components/UserForm';
import NotFound from './components/NotFound';
import { useAuth } from './hooks/useAuth';
import { apiService } from './services/api';
import './App.css';

function AdminShell({
    children,
    userName,
    userRole,
    onLogout,
}: {
    children: React.ReactNode;
    userName?: string;
    userRole?: string;
    onLogout: () => void;
}) {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="app-content">
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div className="container-fluid">
                        <span className="navbar-brand">
                            <i className="fas fa-seedling me-2"></i>
                            Disagro Admin
                        </span>
                        <div className="navbar-nav ms-auto">
                            <div className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-user me-2"></i>
                                    {userName || 'Usuario'}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <span className="dropdown-item-text">
                                            <small className="text-muted">Rol: {userRole}</small>
                                        </span>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={onLogout}>
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
                {children}
            </div>
        </div>
    );
}

function App() {
    const { isAuthenticated, loading, user, login, logout } = useAuth();
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        const currentUser = apiService.getUser();
        if (currentUser) {
            login(currentUser);
            navigate('/admin');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<ConfirmationForm />} />
            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <Navigate to="/admin" replace />
                    ) : (
                        <Login onLoginSuccess={handleLoginSuccess} />
                    )
                }
            />

            <Route
                path="/admin"
                element={
                    isAuthenticated ? (
                        <AdminShell
                            userName={user?.name}
                            userRole={user?.role}
                            onLogout={logout}
                        >
                            <Home userName={user?.name} userRole={user?.role} />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/items"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ItemsList />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/items/nuevo"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ItemForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/items/editar/:id"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ItemForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/items/detalle/:id"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ItemForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/confirmations"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ConfirmationsList />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/confirmations/:id"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <ConfirmationDetail />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/users"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <UsersList />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/users/nuevo"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <UserForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/users/editar/:id"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <UserForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/users/detalle/:id"
                element={
                    isAuthenticated ? (
                        <AdminShell userName={user?.name} userRole={user?.role} onLogout={logout}>
                            <UserForm />
                        </AdminShell>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}

export default App;
