import DataTable from './DataTable';
import type { TableColumn } from '../types/dataTable';
import type { Item } from '../services/itemsService';

export default function ItemsList() {
    const columns: TableColumn<Item>[] = [
        { prop: 'name', name: 'Nombre', sortable: true },
        {
            prop: 'type',
            name: 'Tipo',
            cellRenderer: (value) => (
                <span className={`badge ${value === 'SERVICE' ? 'bg-info' : 'bg-success'}`}>
                    {value === 'SERVICE' ? 'Servicio' : 'Producto'}
                </span>
            ),
        },
        {
            prop: 'price',
            name: 'Precio (Q)',
            cellRenderer: (value) => <span>Q {Number(value).toFixed(2)}</span>,
        },
        {
            prop: 'active',
            name: 'Estado',
            cellRenderer: (value) => (
                <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
    ];

    return (
        <div className="p-4">
            <DataTable<Item>
                title="Catálogo de servicios y productos"
                columns={columns}
                apiUrl="/items?incluirInactivos=true"
                showNewButton={true}
                newButtonRoute="/admin/items/nuevo"
                newButtonText="Nuevo ítem"
                detailRoute="/admin/items/detalle"
                showSearch={true}
                searchFields={['name', 'type', 'description']}
                showPagination={true}
                pageSize={10}
                requireAuth={true}
            />
        </div>
    );
}
