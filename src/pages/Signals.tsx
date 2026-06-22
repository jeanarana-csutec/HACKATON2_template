import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { Signal } from '../types'
import { getSignalFeed } from '../api/signals'

const SIGNAL_TYPES = ['', 'HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA']
const SEVERITIES = ['', 'LEVE', 'MODERADO', 'GRAVE', 'CRITICO']
const STATUSES = ['', 'RECIBIDA', 'PROCESANDO', 'ATENDIDA']

export default function Signals() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [signals, setSignals] = useState<Signal[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const signalType = searchParams.get('signalType') ?? ''
  const severity = searchParams.get('severity') ?? ''
  const status = searchParams.get('status') ?? ''
  const q = searchParams.get('q') ?? ''

  const filtersKey = `${signalType}|${severity}|${status}|${q}`

  const resetFeed = useCallback(() => {
    setSignals([])
    setCursor(null)
    setHasMore(true)
    setError('')
  }, [])

  useEffect(() => {
    resetFeed()
  }, [filtersKey, resetFeed])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    setError('')

    try {
      const res = await getSignalFeed({
        cursor: cursor ?? undefined,
        limit: 15,
        signalType: signalType || undefined,
        severity: severity || undefined,
        status: status || undefined,
        q: q || undefined,
      })

      setSignals((prev) => {
        const existing = new Set(prev.map((s) => s.id))
        const newItems = res.items.filter((s) => !existing.has(s.id))
        return [...prev, ...newItems]
      })
      setCursor(res.nextCursor)
      setHasMore(res.hasMore)
    } catch (err: unknown) {
      setError(err instanceof Object && 'response' in err
        ? (err as { response: { data: { message: string } } }).response?.data?.message || 'Error al cargar'
        : 'Error al cargar')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [cursor, hasMore, signalType, severity, status, q])

  useEffect(() => {
    if (signals.length === 0 && hasMore) {
      loadMore()
    }
  }, [signals.length, hasMore, loadMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Feed de Senales</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />

        <select
          value={signalType}
          onChange={(e) => updateParam('signalType', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {SIGNAL_TYPES.map((t) => (
            <option key={t} value={t}>{t || 'Todos los tipos'}</option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => updateParam('severity', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s || 'Todas las severidades'}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'Todos los estados'}</option>
          ))}
        </select>
      </div>

      {error && !loading && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-4">
          {error}
          <button onClick={loadMore} className="ml-4 underline text-sm">Reintentar</button>
        </div>
      )}

      <div className="space-y-3">
        {signals.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/signals/${s.id}`)}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{s.tropel.name}</p>
                <p className="text-sm text-gray-400 mt-1">{s.rawContent}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  s.severity === 'CRITICO' ? 'bg-red-900 text-red-200' :
                  s.severity === 'GRAVE' ? 'bg-orange-900 text-orange-200' :
                  s.severity === 'MODERADO' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-green-900 text-green-200'
                }`}>
                  {s.severity}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  s.status === 'ATENDIDA' ? 'bg-green-900 text-green-200' :
                  s.status === 'PROCESANDO' ? 'bg-blue-900 text-blue-200' :
                  'bg-gray-700 text-gray-200'
                }`}>
                  {s.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>{s.signalType}</span>
              <span>{new Date(s.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <p className="text-gray-400">Cargando...</p>
        </div>
      )}

      {!hasMore && signals.length > 0 && (
        <p className="text-center text-gray-500 mt-4">Fin de las senales</p>
      )}

      <div ref={sentinelRef} className="h-4" />
    </div>
  )
}
