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
        a.download = 'export.csv'
        a.click()
    }

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {(searchable || exportable) && (
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gray-50">
                    {searchable && (
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar en la tabla..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    )}
                    {exportable && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline font-medium">Exportar CSV</span>
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    {column.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500 font-medium">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-all group">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:text-gray-900 transition-colors">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {onView && (
                                                    <button
                                                        onClick={() => onView(row)}
                                                        className="px-2 py-1 text-[11px] bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-all border border-blue-200 hover:border-blue-300 font-medium"
                                                    >
                                                        Ver
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="px-2 py-1 text-[11px] bg-yellow-100 text-yellow-400 hover:bg-yellow-100 rounded-md transition-all border border-yellow-200 hover:border-yellow-300 font-medium"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="px-2 py-1 text-[11px] bg-yellow-100 text-yellow-400 hover:bg-yellow-100 rounded-md transition-all border border-yellow-200 hover:border-yellow-300 font-medium"
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
                <div className="px-6 py-4 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-600 font-medium">
                        Mostrando <span className="text-gray-900 font-bold">{startIndex + 1}</span> a <span className="text-gray-900 font-bold">{Math.min(endIndex, filteredData.length)}</span> de <span className="text-gray-900 font-bold">{filteredData.length}</span> resultados
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105 border-2 border-gray-300"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-4 py-2 text-gray-700 text-sm font-medium bg-white rounded-lg border-2 border-gray-300">
                            Página <span className="text-gray-900 font-bold">{currentPage}</span> de <span className="text-gray-900 font-bold">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105 border-2 border-gray-300"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
