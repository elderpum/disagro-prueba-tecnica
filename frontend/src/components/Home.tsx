import { Link } from 'react-router-dom';
import './Home.css';

interface HomeProps {
    userName?: string;
    userRole?: string;
}

export default function Home({ userName, userRole }: HomeProps) {
    return (
        <div className="home-container">
            <div className="welcome-section">
                <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-home me-3 text-primary" style={{ fontSize: '2.5rem' }}></i>
                    <h1 className="mb-0">Panel administrativo</h1>
                </div>
                <p className="lead mb-2">
                    Bienvenido, <strong>{userName || 'Usuario'}</strong>
                </p>
                <p className="text-muted mb-3">
                    Rol: <strong>{userRole || 'N/A'}</strong>
                </p>
                <div className="d-flex gap-2 flex-wrap">
                    <Link to="/admin/items" className="btn btn-primary">
                        <i className="fas fa-box-open me-2"></i>Catálogo
                    </Link>
                    <Link to="/admin/confirmations" className="btn btn-outline-primary">
                        <i className="fas fa-calendar-check me-2"></i>Confirmaciones
                    </Link>
                </div>
            </div>
        </div>
    );
}
