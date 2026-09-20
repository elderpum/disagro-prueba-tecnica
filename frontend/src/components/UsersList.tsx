import DataTable from './DataTable';
import type { TableColumn } from '../types/dataTable';
import type { User } from '../services/usersService';

export default function UsersList() {
    const columns: TableColumn<User>[] = [
        { prop: 'name', name: 'Nombre' },
        { prop: 'email', name: 'Email' },
        { prop: 'role', name: 'Rol' },
        {
            prop: 'active',
            name: 'Estado',
            cellRenderer: (value) => (
                <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            prop: 'createdAt',
            name: 'Creado',
            cellRenderer: (value) => (
                <span>{value ? new Date(String(value)).toLocaleDateString('es-GT') : '-'}</span>
            ),
        },
    ];

    return (
        <div className="p-4">
            <DataTable<User>
                title="Usuarios administrativos"
                columns={columns}
                apiUrl="/users"
                showNewButton={true}
                newButtonRoute="/admin/users/nuevo"
                newButtonText="Nuevo usuario"
                detailRoute="/admin/users/detalle"
                showSearch={true}
                searchFields={['name', 'email', 'role']}
                showPagination={true}
                pageSize={10}
                requireAuth={true}
            />
        </div>
    );
}
