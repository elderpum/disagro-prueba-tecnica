import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { itemsService, type Item } from '../services/itemsService';
import {
    confirmationsService,
    type DiscountResult,
} from '../services/confirmationsService';
import './ConfirmationForm.css';

export default function ConfirmationForm() {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [clientName, setClientName] = useState('');
    const [clientLastname, setClientLastname] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [eventDateTime, setEventDateTime] = useState('');
    const [discounts, setDiscounts] = useState<DiscountResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const response = await itemsService.obtenerTodos(false);
            if (response.success && response.data) {
                setItems(response.data);
            } else {
                setError(response.message || 'No se pudo cargar el catálogo');
            }
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const preview = async () => {
            if (selectedIds.length === 0) {
                setDiscounts(null);
                return;
            }

            const response = await confirmationsService.preview(selectedIds);
            if (response.success && response.data) {
                setDiscounts(response.data.discounts);
            }
        };

        const timer = setTimeout(preview, 250);
        return () => clearTimeout(timer);
    }, [selectedIds]);

    const services = useMemo(() => items.filter((i) => i.type === 'SERVICE'), [items]);
    const products = useMemo(() => items.filter((i) => i.type === 'PRODUCT'), [items]);

    const toggleItem = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        setSuccessMessage('');
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (selectedIds.length === 0) {
            setError('Selecciona al menos un servicio o producto');
            return;
        }

        setSubmitting(true);
        const response = await confirmationsService.crear({
            clientName,
            clientLastname,
            clientEmail,
            eventDateTime,
            itemIds: selectedIds,
        });

        if (response.success && response.data) {
            setSuccessMessage(
                `¡Asistencia confirmada! Total final: Q ${Number(response.data.finalAmount).toFixed(2)}`
            );
            setClientName('');
            setClientLastname('');
            setClientEmail('');
            setEventDateTime('');
            setSelectedIds([]);
            setDiscounts(null);
        } else {
            setError(response.message || 'No se pudo registrar la confirmación');
        }

        setSubmitting(false);
    };

    const renderItemList = (list: Item[], title: string, icon: string) => (
        <div className="confirmation-section mb-4">
            <h4 className="mb-3">
                <i className={`${icon} me-2 text-primary`}></i>
                {title}
            </h4>
            <div className="row g-3">
                {list.map((item) => {
                    const checked = selectedIds.includes(item.id);
                    return (
                        <div className="col-md-6" key={item.id}>
                            <label className={`item-option ${checked ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={checked}
                                    onChange={() => toggleItem(item.id)}
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between gap-2">
                                        <strong>{item.name}</strong>
                                        <span className="text-primary fw-bold">
                                            Q {Number(item.price).toFixed(2)}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <small className="text-muted d-block mt-1">
                                            {item.description}
                                        </small>
                                    )}
                                </div>
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="confirmation-page">
            <header className="confirmation-header">
                <div className="container d-flex justify-content-between align-items-center py-3">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="fas fa-seedling me-2"></i>
                            Disagro
                        </h1>
                        <small>Evento de promociones anuales</small>
                    </div>
                    <Link to="/login" className="btn btn-outline-light btn-sm">
                        <i className="fas fa-user-lock me-1"></i>
                        Admin
                    </Link>
                </div>
            </header>

            <main className="container py-4">
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card confirmation-card p-4">
                            <h2 className="h4 mb-1">Confirma tu asistencia</h2>
                            <p className="text-muted mb-4">
                                Completa tus datos y selecciona los servicios y productos de tu interés.
                            </p>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : (
                                <form onSubmit={onSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Nombres</label>
                                            <input
                                                className="form-control"
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Apellidos</label>
                                            <input
                                                className="form-control"
                                                value={clientLastname}
                                                onChange={(e) => setClientLastname(e.target.value)}
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Correo electrónico</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Fecha y hora del evento</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                value={eventDateTime}
                                                onChange={(e) => setEventDateTime(e.target.value)}
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    {renderItemList(services, 'Servicios de interés', 'fas fa-tools')}
                                    {renderItemList(products, 'Productos de interés', 'fas fa-box')}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Confirmando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check me-2"></i>
                                                Confirmar asistencia
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card confirmation-summary p-4 sticky-top">
                            <h3 className="h5 mb-3">
                                <i className="fas fa-receipt me-2 text-primary"></i>
                                Resumen de promoción
                            </h3>

                            {!discounts ? (
                                <p className="text-muted mb-0">
                                    Selecciona servicios y productos para calcular tu descuento.
                                </p>
                            ) : (
                                <>
                                    <div className="summary-row">
                                        <span>Servicios ({discounts.servicesCount})</span>
                                        <strong>Q {discounts.servicesSubtotal.toFixed(2)}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Descuento servicios</span>
                                        <strong>{discounts.servicesDiscountPercentage}%</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Productos ({discounts.productsCount})</span>
                                        <strong>Q {discounts.productsSubtotal.toFixed(2)}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Descuento productos</span>
                                        <strong>{discounts.productsDiscountPercentage}%</strong>
                                    </div>
                                    <hr />
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <strong>Q {discounts.totalAmount.toFixed(2)}</strong>
                                    </div>
                                    <div className="summary-row text-success">
                                        <span>Ahorro</span>
                                        <strong>Q {discounts.discountAmount.toFixed(2)}</strong>
                                    </div>
                                    <div className="summary-row summary-total">
                                        <span>Total final</span>
                                        <strong>Q {discounts.finalAmount.toFixed(2)}</strong>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
