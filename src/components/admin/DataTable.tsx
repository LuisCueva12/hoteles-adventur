'use client'

import { useState } from 'react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  onSearch?: (query: string) => void
  onRowClick?: (item: T) => void
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading = false, 
  searchable = false,
  onSearch,
  onRowClick 
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = searchable && searchQuery
    ? data.filter(item => 
        columns.some(column => {
          const value = item[column.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    : data

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-admin-primary-light overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-admin-primary-light">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-admin-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-transparent text-admin-primary placeholder:text-admin-primary/40"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-admin-primary-light border-b border-admin-primary-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium text-admin-primary uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-admin-primary-light">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-admin-accent border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-admin-primary/60">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-admin-primary/60">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-admin-primary-light ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-admin-primary">
                      {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
