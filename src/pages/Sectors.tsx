import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Sector } from '../types'
import { getSectors } from '../api/sectors'

const CLIMATE_NAMES: Record<string, string> = {
  PIXEL_FOREST: 'Bosque Pixel',
  NEON_CAVE: 'Cueva Neon',
  CLOUD_AQUARIUM: 'Acuario Nube',
  RETRO_ARCADE: 'Arcade Retro',
}

export default function Sectors() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSectors()
      .then((res) => {
        if (!cancelled) setSectors(res.items)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Error al cargar sectores')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando sectores...</p>
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

  if (sectors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No hay sectores disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sectores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => (
          <Link
            key={s.id}
            to={`/sectors/${s.id}/story`}
            className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition border border-gray-700 hover:border-blue-500/50"
          >
            <h3 className="text-lg font-bold">{s.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{CLIMATE_NAMES[s.climate] ?? s.climate}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Capacidad: <span className="text-gray-300">{s.currentLoad}/{s.capacity}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                s.stabilityLevel >= 70 ? 'bg-green-900 text-green-200' :
                s.stabilityLevel >= 40 ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                Estabilidad: {s.stabilityLevel}%
              </span>
            </div>
            <div className="mt-3 bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${s.stabilityLevel}%`,
                  background: s.stabilityLevel >= 70 ? '#22c55e' : s.stabilityLevel >= 40 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
