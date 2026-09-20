import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usersService } from '../services/usersService';

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isDetail = location.pathname.includes('/detalle/');
    const isEdit = location.pathname.includes('/editar/');
    const isNew = !id;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin');
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            setLoading(true);
            const response = await usersService.obtenerPorId(Number(id));
            if (response.success && response.data) {
                setName(response.data.name);
                setEmail(response.data.email);
                setRole(response.data.role);
                setActive(response.data.active);
            } else {
                setError(response.message || 'No se pudo cargar el usuario');
            }
            setLoading(false);
        };

        load();
    }, [id]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isDetail) return;

        setLoading(true);
        setError('');
        setSuccess('');

        const response = isNew
            ? await usersService.crear({
                name: name.trim(),
                email: email.trim(),
                password,
                role: role.trim() || 'Admin',
                active: true,
            })
            : await usersService.actualizar(Number(id), {
                name: name.trim(),
                email: email.trim(),
                password: password.trim() || undefined,
                role: role.trim() || 'Admin',
                active,
            });

        if (response.success) {
            setSuccess(isNew ? 'Usuario creado' : 'Usuario actualizado');
            setTimeout(() => navigate('/admin/users'), 800);
        } else {
            setError(response.message || 'No se pudo guardar');
        }

        setLoading(false);
    };

    const onDelete = async () => {
        if (!id || !window.confirm('¿Desactivar este usuario?')) return;
        setLoading(true);
        const response = await usersService.eliminar(Number(id));
        if (response.success) {
            navigate('/admin/users');
        } else {
            setError(response.message || 'No se pudo desactivar');
            setLoading(false);
        }
    };

    const readOnly = isDetail;

    return (
        <div className="p-4">
            <div className="card p-4" style={{ maxWidth: 720 }}>
                <h3 className="mb-3">
                    {isNew ? 'Nuevo usuario' : isEdit ? 'Editar usuario' : 'Detalle del usuario'}
                </h3>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={readOnly || loading}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={readOnly || loading}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Contraseña {isNew ? '' : '(dejar vacío para no cambiar)'}
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={isNew}
                            minLength={isNew ? 6 : undefined}
                            disabled={readOnly || loading}
                            placeholder={isNew ? 'Mínimo 6 caracteres' : '••••••'}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Rol</label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={readOnly || loading}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Operador">Operador</option>
                        </select>
                    </div>

                    {!isNew && (
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                disabled={readOnly || loading}
                                id="userActiveCheck"
                            />
                            <label className="form-check-label" htmlFor="userActiveCheck">
                                Activo
                            </label>
                        </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/admin/users')}
                        >
                            Volver
                        </button>

                        {isDetail && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => navigate(`/admin/users/editar/${id}`)}
                            >
                                Editar
                            </button>
                        )}

                        {!readOnly && (
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        )}

                        {(isDetail || isEdit) && (
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={onDelete}
                                disabled={loading}
                            >
                                Desactivar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
