'use client'

import { useState, useEffect } from 'react'
import { dashboardService, type DashboardStats, type ActivityLog } from '@/services/dashboard.service'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const [statsData, activityData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity()
      ])

      setStats(statsData)
      setRecentActivity(activityData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('No se pudo cargar la información del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async (): Promise<void> => {
    await loadDashboardData()
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshData
  }
}
