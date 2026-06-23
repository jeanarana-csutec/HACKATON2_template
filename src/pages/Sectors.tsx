import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Sector } from '../types'
import { getSectors } from '../api/sectors'
import { flushSync } from 'react-dom'

const CLIMATE_LABEL: Record<string, string> = {
  PIXEL_FOREST: 'Pixel Forest',
  NEON_CAVE: 'Neon Cave',
  CLOUD_AQUARIUM: 'Cloud Aquarium',
  RETRO_ARCADE: 'Retro Arcade',
}

export default function Sectors() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getSectors()
      .then((res) => { if (!cancelled) setSectors(res.items) })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Object && 'response' in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : undefined
          setError(msg || 'Error al cargar sectores')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function handleSectorClick(sectorId: string) {
    const target = `/sectors/${sectorId}/story`
    if ('startViewTransition' in document) {
      ;(document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          flushSync(() => navigate(target))
        })
    } else {
      navigate(target)
    }
  }

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
        <p className="text-gray-400">Sin sectores disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sectores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => handleSectorClick(sector.id)}
            className="bg-gray-800 rounded-lg p-4 text-left hover:bg-gray-700 motion-safe:transition border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">{sector.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">{sector.sectorCode}</p>
                <p className="text-xs text-gray-500 mt-1">{CLIMATE_LABEL[sector.climate] ?? sector.climate}</p>
              </div>
              <span className="text-lg font-bold text-blue-400 shrink-0">{sector.stabilityLevel}%</span>
            </div>
            <div className="mt-3 text-xs text-gray-400 flex gap-3">
              <span>Carga: {sector.currentLoad}/{sector.capacity}</span>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${(sector.currentLoad / sector.capacity) * 100}%` }}
              />
            </div>
            <p className="text-xs text-blue-400 mt-3">Ver historia &rarr;</p>
          </button>
        ))}
      </div>
    </div>
  )
}
