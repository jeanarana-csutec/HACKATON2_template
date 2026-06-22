import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Tropel } from '../types'
import { getTropels } from '../api/tropels'

const SORT_OPTIONS = [
  { value: 'updatedAt,desc', label: 'Actualizacion (desc)' },
  { value: 'name,asc', label: 'Nombre (asc)' },
  { value: 'chaosIndex,desc', label: 'Caos (desc)' },
]

const SPECIES = ['', 'BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY']
const VITAL_STATES = ['', 'ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO']

export default function Tropels() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tropels, setTropels] = useState<Tropel[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const species = searchParams.get('species') ?? ''
  const vitalState = searchParams.get('vitalState') ?? ''
  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'updatedAt,desc'

  const size = 20

  const fetchTropels = useCallback(() => {
    let cancelled = false
    const requestId = Date.now()

    setLoading(true)
    setError('')

    getTropels({ page, size, species: species || undefined, vitalState: vitalState || undefined, q: q || undefined, sort })
      .then((res) => {
        if (!cancelled && requestId) {
          setTropels(res.content)
          setTotalPages(res.totalPages)
          setTotalElements(res.totalElements)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Error al cargar tropeles')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, species, vitalState, q, sort])

  useEffect(fetchTropels, [fetchTropels])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    if (key !== 'page') next.set('page', '0')
    setSearchParams(next)
  }

  function goToPage(p: number) {
    if (p < 0 || p >= totalPages) return
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Atlas de Tropeles</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />

        <select
          value={species}
          onChange={(e) => updateParam('species', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {SPECIES.map((s) => (
            <option key={s} value={s}>{s || 'Todas las especies'}</option>
          ))}
        </select>

        <select
          value={vitalState}
          onChange={(e) => updateParam('vitalState', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {VITAL_STATES.map((s) => (
            <option key={s} value={s}>{s || 'Todos los estados'}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-4">
          {error}
          <button onClick={fetchTropels} className="ml-4 underline text-sm">Reintentar</button>
        </div>
      )}

      <div className="overflow-x-auto" style={{ minHeight: loading ? '200px' : 'auto' }}>
        {loading && tropels.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Cargando...</p>
          </div>
        )}

        {!loading && !error && tropels.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Sin resultados</p>
          </div>
        )}

        {tropels.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 px-3">Nombre</th>
                <th className="py-2 px-3">Especie</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3">Energia</th>
                <th className="py-2 px-3">Caos</th>
                <th className="py-2 px-3">Mutacion</th>
                <th className="py-2 px-3">Sector</th>
                <th className="py-2 px-3">Guardian</th>
              </tr>
            </thead>
            <tbody>
              {tropels.map((t) => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 px-3 font-medium">{t.name}</td>
                  <td className="py-2 px-3">{t.species}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      t.vitalState === 'CRITICO' ? 'bg-red-900 text-red-200' :
                      t.vitalState === 'MUTANDO' ? 'bg-purple-900 text-purple-200' :
                      t.vitalState === 'AGITADO' ? 'bg-yellow-900 text-yellow-200' :
                      t.vitalState === 'HAMBRIENTO' ? 'bg-orange-900 text-orange-200' :
                      'bg-green-900 text-green-200'
                    }`}>
                      {t.vitalState}
                    </span>
                  </td>
                  <td className="py-2 px-3">{t.energyLevel}</td>
                  <td className="py-2 px-3">{t.chaosIndex}</td>
                  <td className="py-2 px-3">{t.mutationStage}</td>
                  <td className="py-2 px-3 text-gray-400">{t.sector.name}</td>
                  <td className="py-2 px-3 text-gray-400">{t.guardianName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>{totalElements} tropeles | Pagina {page + 1} de {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 0}
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
          >
            Anterior
          </button>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
