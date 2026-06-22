import { useEffect, useState } from 'react'
import type { DashboardSummary } from '../types'
import { getDashboardSummary } from '../api/dashboard'

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getDashboardSummary()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Error al cargar dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No hay datos disponibles</p>
      </div>
    )
  }

  const cards = [
    { label: 'Total Tropeles', value: data.totalTropels, color: 'bg-blue-600' },
    { label: 'Tropeles Criticos', value: data.criticalTropels, color: 'bg-red-600' },
    { label: 'Senales Abiertas', value: data.openSignals, color: 'bg-yellow-600' },
    { label: 'Estabilidad Promedio', value: `${data.sectorStabilityAvg}%`, color: 'bg-green-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-lg p-4 shadow`}>
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Senales por Severidad</h3>
        <div className="space-y-2">
          {Object.entries(data.signalsBySeverity).map(([severity, count]) => (
            <div key={severity} className="flex items-center gap-2">
              <span className="text-sm w-24 text-gray-400">{severity}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${(count / data.openSignals) * 100}%` }}
                />
              </div>
              <span className="text-sm w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Ultima actualizacion: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}
