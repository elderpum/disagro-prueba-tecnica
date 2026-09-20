import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataTable } from '../hooks/useDataTable';
import type { TableConfig } from '../types/dataTable';
import './DataTable.css';

interface DataTableProps<T = unknown> extends TableConfig<T> {
    className?: string;
}

export default function DataTable<T = unknown>(props: DataTableProps<T>) {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        data,
        loading,
        error,
        searchTerm,
        currentPage,
        totalPages,
        handleSearch,
        handlePageChange,
        refresh,
    } = useDataTable<T>(props);

    useEffect(() => {
        refresh();
    }, [location.pathname, refresh]);

    const handleRowClick = (row: T) => {
        if (props.onRowClick) {
            props.onRowClick(row);
        } else if (props.detailRoute && (row as { id?: number }).id) {
            navigate(`${props.detailRoute}/${(row as { id: number }).id}`);
        }
    };

    const handleNewClick = () => {
        if (props.newButtonRoute) {
            navigate(props.newButtonRoute);
        }
    };

    const renderCell = (column: DataTableProps<T>['columns'][number], row: T) => {
        const value = (row as Record<string, unknown>)[column.prop as string];

        if (column.cellRenderer) {
            return column.cellRenderer(value, row);
        }

        if (value === null || value === undefined) {
            return <span className="text-muted">-</span>;
        }

        if (typeof value === 'boolean') {
            return (
                <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
                    {value ? 'Sí' : 'No'}
                </span>
            );
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className={`data-table-container ${props.className || ''}`}>
            <div className="data-table-header d-flex justify-content-between align-items-center mb-3">
                {props.title && <h3 className="mb-0">{props.title}</h3>}
                {props.showNewButton && props.newButtonRoute && (
                    <button className="btn btn-primary" onClick={handleNewClick}>
                        <i className="fas fa-plus me-2"></i>
                        {props.newButtonText || 'Nuevo'}
                    </button>
                )}
            </div>

            {props.showSearch !== false && (
                <div className="data-table-search mb-3">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover tablaEstilos">
                    <thead>
                        <tr>
                            {props.columns.map((column, index) => (
                                <th
                                    key={index}
                                    style={column.width ? { width: column.width } : undefined}
                                    className={column.className}
                                >
                                    {column.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={props.columns.length} className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={props.columns.length} className="text-center py-4 text-muted">
                                    <i className="fas fa-inbox me-2"></i>
                                    No hay registros disponibles
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={(row as { id?: number }).id || rowIndex}
                                    className="hoverRow"
                                    onClick={() => handleRowClick(row)}
                                    style={{
                                        cursor: props.onRowClick || props.detailRoute ? 'pointer' : 'default',
                                    }}
                                >
                                    {props.columns.map((column, colIndex) => (
                                        <td key={colIndex} className={column.className}>
                                            {renderCell(column, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {props.showPagination && totalPages > 1 && (
                <nav aria-label="Paginación de la tabla" className="mt-3">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <li
                                key={page}
                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                            >
                                <button className="page-link" onClick={() => handlePageChange(page)}>
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}
