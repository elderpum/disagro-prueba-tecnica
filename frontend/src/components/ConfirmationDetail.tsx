import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmationsService, type Confirmation } from '../services/confirmationsService';

export default function ConfirmationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            const response = await confirmationsService.obtenerPorId(Number(id));
            if (response.success && response.data) {
                setConfirmation(response.data);
            } else {
                setError(response.message || 'Confirmación no encontrada');
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const onDelete = async () => {
        if (!id || !window.confirm('¿Eliminar esta confirmación?')) return;
        const response = await confirmationsService.eliminar(Number(id));
        if (response.success) {
            navigate('/admin/confirmations');
        } else {
            setError(response.message || 'No se pudo eliminar');
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (!confirmation) {
        return (
            <div className="p-4">
                <div className="alert alert-danger">{error || 'Sin datos'}</div>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/confirmations')}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="card p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="mb-0">Confirmación #{confirmation.id}</h3>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/confirmations')}>
                            Volver
                        </button>
                        <button className="btn btn-outline-danger" onClick={onDelete}>
                            Eliminar
                        </button>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row mb-4">
                    <div className="col-md-6">
                        <p className="mb-1"><strong>Cliente:</strong> {confirmation.clientName} {confirmation.clientLastname}</p>
                        <p className="mb-1"><strong>Email:</strong> {confirmation.clientEmail}</p>
                        <p className="mb-1">
                            <strong>Fecha evento:</strong>{' '}
                            {new Date(confirmation.eventDateTime).toLocaleString('es-GT')}
                        </p>
                    </div>
                    <div className="col-md-6">
                        <p className="mb-1"><strong>Subtotal:</strong> Q {Number(confirmation.totalAmount).toFixed(2)}</p>
                        <p className="mb-1"><strong>Desc. servicios:</strong> {confirmation.servicesDiscountPercentage}%</p>
                        <p className="mb-1"><strong>Desc. productos:</strong> {confirmation.productsDiscountPercentage}%</p>
                        <p className="mb-1"><strong>Total final:</strong> Q {Number(confirmation.finalAmount).toFixed(2)}</p>
                    </div>
                </div>

                <h5>Ítems seleccionados</h5>
                <div className="table-responsive">
                    <table className="table tablaEstilos">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Precio snapshot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(confirmation.items || []).map((item) => (
                                <tr key={`${item.confirmationId}-${item.itemId}`}>
                                    <td>{item.itemName}</td>
                                    <td>
                                        <span className={`badge ${item.itemType === 'SERVICE' ? 'bg-info' : 'bg-success'}`}>
                                            {item.itemType === 'SERVICE' ? 'Servicio' : 'Producto'}
                                        </span>
                                    </td>
                                    <td>Q {Number(item.unitPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
