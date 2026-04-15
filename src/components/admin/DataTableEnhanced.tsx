'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Search, RefreshCw, Loader2 } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableEnhancedProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  selectable?: boolean
  pageSize?: number
  onSelectionChange?: (selectedItems: T[]) => void
  onRowClick?: (item: T) => void
  onRefresh?: () => void
}

export function DataTableEnhanced<T>({ 
  data, 
  columns, 
  loading = false, 
  searchable = false,
  selectable = false,
  pageSize = 10,
  onSelectionChange,
  onRowClick,
  onRefresh
}: DataTableEnhancedProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  })
  const [selectedItems, setSelectedItems] = useState<T[]>([])

  const handleSort = (key: keyof T | string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([])
    } else {
      setSelectedItems([...filteredData])
    }
    onSelectionChange?.(selectedItems.length === filteredData.length ? [] : [...filteredData])
  }

  const handleSelectItem = (item: T) => {
    const isSelected = selectedItems.some(selected => 
      JSON.stringify(selected) === JSON.stringify(item)
    )
    
    const newSelection = isSelected 
      ? selectedItems.filter(selected => JSON.stringify(selected) !== JSON.stringify(item))
      : [...selectedItems, item]
    
    setSelectedItems(newSelection)
    onSelectionChange?.(newSelection)
  }

  const getFilteredAndSortedData = (): T[] => {
    let filtered = [...data]

    if (searchTerm) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          if (typeof column.key === 'string' && !(column.key in (item as any))) {
            return false
          }
          const value = (item as any)[column.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (typeof sortConfig.key === 'string' && !(sortConfig.key in (a as any))) {
          return 0
        }
        const aValue = (a as any)[sortConfig.key]
        const bValue = (b as any)[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const filteredData = getFilteredAndSortedData()
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const SortIcon = ({ columnKey }: { columnKey: keyof T | string }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {(searchable || onRefresh) && (
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(selected => 
                          JSON.stringify(selected) === JSON.stringify(item)
                        )}
                        onChange={() => handleSelectItem(item)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render((item as any)[column.key], item) : String((item as any)[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
