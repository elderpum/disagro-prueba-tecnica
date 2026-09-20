import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <i className="fas fa-compass not-found-icon"></i>
                <h1 className="not-found-code">404</h1>
                <h2 className="not-found-title">Página no encontrada</h2>
                <p className="not-found-message">
                    La ruta que buscas no existe o fue movida.
                </p>
                <Link to="/" className="btn btn-primary not-found-button">
                    Ir al formulario del evento
                </Link>
            </div>
        </div>
    );
}
