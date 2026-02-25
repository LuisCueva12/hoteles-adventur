'use client'

import { useState } from 'react'

interface Column {
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
    columns: Column[]
    data: any[]
    onEdit?: (row: any) => void
    onDelete?: (row: any) => void
    onView?: (row: any) => void
}

export function DataTable({ columns, data, onEdit, onDelete, onView }: DataTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const totalPages = Math.ceil(data.length / itemsPerPage)
    
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = data.slice(startIndex, endIndex)

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {column.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 text-sm text-gray-300">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="px-6 py-4 text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                {onView && (
                                                    <button
                                                        onClick={() => onView(row)}
                                                        className="px-3 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                                    >
                                                        Ver
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="px-3 py-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} resultados
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-gray-400">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
