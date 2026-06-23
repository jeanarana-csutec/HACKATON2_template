import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Signal, SignalStatus } from '../types'
import { getSignal, updateSignalStatus } from '../api/signals'

export default function SignalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [signal, setSignal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError('')
    getSignal(id)
      .then((res) => {
        if (!cancelled) setSignal(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Error al cargar la senal')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  async function handleUpdateStatus(newStatus: SignalStatus) {
    if (!signal) return
    setUpdating(true)
    setUpdateError('')
    setConfirmMsg('')
    try {
      const updated = await updateSignalStatus(signal.id, newStatus)
      setSignal(updated)
      setConfirmMsg(`Estado actualizado a ${newStatus}`)
      setTimeout(() => setConfirmMsg(''), 3000)

      const saved = sessionStorage.getItem('signals-feed-state')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.signals) {
            parsed.signals = parsed.signals.map((s: Signal) =>
              s.id === updated.id ? updated : s
            )
            sessionStorage.setItem('signals-feed-state', JSON.stringify(parsed))
          }
        } catch {
          /* ignore malformed cache */
        }
      }
    } catch (err: unknown) {
      setUpdateError(
        err instanceof Object && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || 'Error al actualizar'
          : 'Error al actualizar'
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando senal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded">
        {error}
        <button onClick={() => navigate(0)} className="ml-4 underline text-sm">Reintentar</button>
      </div>
    )
  }

  if (!signal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Senal no encontrada</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white mb-4 flex items-center gap-1 transition"
      >
        &larr; Volver
      </button>

      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Detalle de Senal</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">ID</span>
            <span>{signal.id}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Tropel</span>
            <span>{signal.tropel.name} ({signal.tropel.species})</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Tipo</span>
            <span>{signal.signalType}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Severidad</span>
            <span>{signal.severity}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Estado</span>
            <span>{signal.status}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Creado</span>
            <span>{new Date(signal.createdAt).toLocaleString()}</span>
          </div>
          <div className="pt-2">
            <span className="text-gray-400 block mb-1">Contenido</span>
            <p className="bg-gray-900 rounded p-3">{signal.rawContent}</p>
          </div>
        </div>

        {confirmMsg && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 rounded mt-4 text-sm">
            {confirmMsg}
          </div>
        )}

        {updateError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mt-4 text-sm">
            {updateError}
          </div>
        )}

        {signal.status !== 'ATENDIDA' && (
          <div className="mt-6 flex gap-3">
            {signal.status !== 'PROCESANDO' && (
              <button
                onClick={() => handleUpdateStatus('PROCESANDO')}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded font-medium text-sm transition"
              >
                {updating ? 'Actualizando...' : 'Procesar'}
              </button>
            )}
            <button
              onClick={() => handleUpdateStatus('ATENDIDA')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded font-medium text-sm transition"
            >
              {updating ? 'Actualizando...' : 'Atender'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
