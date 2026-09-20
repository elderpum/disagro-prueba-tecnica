import DataTable from './DataTable';
import type { TableColumn } from '../types/dataTable';
import type { Confirmation } from '../services/confirmationsService';

export default function ConfirmationsList() {
    const columns: TableColumn<Confirmation>[] = [
        {
            prop: 'clientName',
            name: 'Cliente',
            cellRenderer: (_value, row) => (
                <span>
                    {row.clientName} {row.clientLastname}
                </span>
            ),
        },
        { prop: 'clientEmail', name: 'Email' },
        {
            prop: 'eventDateTime',
            name: 'Fecha evento',
            cellRenderer: (value) => (
                <span>{value ? new Date(String(value)).toLocaleString('es-GT') : '-'}</span>
            ),
        },
        {
            prop: 'totalAmount',
            name: 'Subtotal',
            cellRenderer: (value) => <span>Q {Number(value).toFixed(2)}</span>,
        },
        {
            prop: 'finalAmount',
            name: 'Total final',
            cellRenderer: (value) => <strong>Q {Number(value).toFixed(2)}</strong>,
        },
        {
            prop: 'servicesDiscountPercentage',
            name: 'Desc. serv.',
            cellRenderer: (value) => <span>{Number(value)}%</span>,
        },
        {
            prop: 'productsDiscountPercentage',
            name: 'Desc. prod.',
            cellRenderer: (value) => <span>{Number(value)}%</span>,
        },
    ];

    return (
        <div className="p-4">
            <DataTable<Confirmation>
                title="Confirmaciones de asistencia"
                columns={columns}
                apiUrl="/confirmations"
                showNewButton={false}
                detailRoute="/admin/confirmations"
                showSearch={true}
                searchFields={['clientName', 'clientLastname', 'clientEmail']}
                showPagination={true}
                pageSize={10}
                requireAuth={true}
            />
        </div>
    );
}
