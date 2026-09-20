import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { itemsService, type ItemType } from '../services/itemsService';

export default function ItemForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isDetail = location.pathname.includes('/detalle/');
    const isEdit = location.pathname.includes('/editar/');
    const isNew = !id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ItemType>('SERVICE');
    const [price, setPrice] = useState(0);
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            setLoading(true);
            const response = await itemsService.obtenerPorId(Number(id));
            if (response.success && response.data) {
                setName(response.data.name);
                setDescription(response.data.description || '');
                setType(response.data.type);
                setPrice(Number(response.data.price));
                setActive(response.data.active);
            } else {
                setError(response.message || 'No se pudo cargar el ítem');
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

        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            type,
            price: Number(price),
            active,
        };

        const response = isNew
            ? await itemsService.crear(payload)
            : await itemsService.actualizar(Number(id), { ...payload, active });

        if (response.success) {
            setSuccess(isNew ? 'Ítem creado' : 'Ítem actualizado');
            setTimeout(() => navigate('/admin/items'), 800);
        } else {
            setError(response.message || 'No se pudo guardar');
        }

        setLoading(false);
    };

    const onDelete = async () => {
        if (!id || !window.confirm('¿Desactivar este ítem?')) return;
        setLoading(true);
        const response = await itemsService.eliminar(Number(id));
        if (response.success) {
            navigate('/admin/items');
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
                    {isNew ? 'Nuevo ítem' : isEdit ? 'Editar ítem' : 'Detalle del ítem'}
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
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={readOnly || loading}
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Tipo</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value as ItemType)}
                                disabled={readOnly || loading}
                            >
                                <option value="SERVICE">Servicio</option>
                                <option value="PRODUCT">Producto</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Precio (Q)</label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                className="form-control"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                required
                                disabled={readOnly || loading}
                            />
                        </div>
                    </div>

                    {!isNew && (
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                disabled={readOnly || loading}
                                id="activeCheck"
                            />
                            <label className="form-check-label" htmlFor="activeCheck">
                                Activo
                            </label>
                        </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/admin/items')}
                        >
                            Volver
                        </button>

                        {isDetail && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => navigate(`/admin/items/editar/${id}`)}
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
