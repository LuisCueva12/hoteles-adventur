import type { ReactNode } from 'react'
import { AdminEmptyState } from './AdminEmptyState'
import { Database } from 'lucide-react'

export type AdminColumn<T> = {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

export function AdminDataTable<T>({
  columns,
  data,
  getRowId,
  emptyTitle = 'No hay registros',
  emptyDescription = 'Aún no existen elementos para mostrar en este módulo.',
}: {
  columns: AdminColumn<T>[]
  data: T[]
  getRowId?: (item: T) => string
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (data.length === 0) {
    return <AdminEmptyState icon={Database} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={getRowId ? getRowId(item) : index}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
