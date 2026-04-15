'use client'

import { useState, useEffect } from 'react'

interface UseTableOptions<T> {
  fetchData: () => Promise<T[]>
  initialData?: T[]
  pageSize?: number
}

interface TableState<T> {
  data: T[]
  loading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  searchTerm: string
  sortBy: keyof T | null
  sortOrder: 'asc' | 'desc'
  selectedItems: T[]
}

export function useTable<T>({ fetchData, initialData = [], pageSize = 10 }: UseTableOptions<T>) {
  const [tableState, setTableState] = useState<TableState<T>>({
    data: initialData,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize,
    searchTerm: '',
    sortBy: null,
    sortOrder: 'asc',
    selectedItems: []
  })

  const loadData = async () => {
    setTableState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await fetchData()
      setTableState(prev => ({ ...prev, data, loading: false }))
    } catch (error) {
      setTableState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error loading data' 
      }))
    }
  }

  const refreshData = () => loadData()

  const setSearchTerm = (searchTerm: string) => {
    setTableState(prev => ({ ...prev, searchTerm, currentPage: 1 }))
  }

  const setSorting = (sortBy: keyof T, sortOrder: 'asc' | 'desc') => {
    setTableState(prev => ({ ...prev, sortBy, sortOrder }))
  }

  const setSelectedItems = (selectedItems: T[]) => {
    setTableState(prev => ({ ...prev, selectedItems }))
  }

  const toggleSelection = (item: T) => {
    setTableState(prev => {
      const isSelected = prev.selectedItems.some(selected => 
        JSON.stringify(selected) === JSON.stringify(item)
      )
      
      return {
        ...prev,
        selectedItems: isSelected 
          ? prev.selectedItems.filter(selected => JSON.stringify(selected) !== JSON.stringify(item))
          : [...prev.selectedItems, item]
      }
    })
  }

  const clearSelection = () => {
    setTableState(prev => ({ ...prev, selectedItems: [] }))
  }

  const selectAll = () => {
    setTableState(prev => ({ ...prev, selectedItems: [...getFilteredData()] }))
  }

  const getFilteredData = (): T[] => {
    let filtered = [...tableState.data]

    if (tableState.searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item as any).some(value =>
          String(value).toLowerCase().includes(tableState.searchTerm.toLowerCase())
        )
      )
    }

    if (tableState.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[tableState.sortBy!]
        const bValue = b[tableState.sortBy!]
        
        if (aValue < bValue) return tableState.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return tableState.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const getPaginatedData = (): T[] => {
    const filtered = getFilteredData()
    const startIndex = (tableState.currentPage - 1) * tableState.pageSize
    const endIndex = startIndex + tableState.pageSize
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalPages = (): number => {
    return Math.ceil(getFilteredData().length / tableState.pageSize)
  }

  const goToPage = (page: number) => {
    const totalPages = getTotalPages()
    if (page >= 1 && page <= totalPages) {
      setTableState(prev => ({ ...prev, currentPage: page }))
    }
  }

  const nextPage = () => goToPage(tableState.currentPage + 1)
  const previousPage = () => goToPage(tableState.currentPage - 1)

  useEffect(() => {
    loadData()
  }, [])

  return {
    tableState,
    loadData,
    refreshData,
    setSearchTerm,
    setSorting,
    setSelectedItems,
    toggleSelection,
    clearSelection,
    selectAll,
    goToPage,
    nextPage,
    previousPage,
    filteredData: getFilteredData(),
    paginatedData: getPaginatedData(),
    totalPages: getTotalPages(),
    hasNextPage: tableState.currentPage < getTotalPages(),
    hasPreviousPage: tableState.currentPage > 1
  }
}
