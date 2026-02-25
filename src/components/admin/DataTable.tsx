'use client'

import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'

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
    searchable?: boolean
    exportable?: boolean
}

export function DataTable({ columns, data, onEdit, onDelete, onView, searchable = true, exportable = true }: DataTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const itemsPerPage = 10
    
    const filteredData = searchable && searchTerm
        ? data.filter(row =>
            columns.some(col =>
                String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : data

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = filteredData.slice(startIndex, endIndex)

    const handleExport = () => {
        const csvContent = [
            columns.map(col => col.label).join(','),
            ...filteredData.map(row =>
                columns.map(col => `"${row[col.key]}"`).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${Date.now()}.csv`
        a.click()
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {(searchable || exportable) && (
                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    {searchable && (
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                            />
                        </div>
                    )}
                    {exportable && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Exportar CSV</span>
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {column.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
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
                <div className="px-6 py-4 border-t border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-3 py-1 text-gray-400 text-sm">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
