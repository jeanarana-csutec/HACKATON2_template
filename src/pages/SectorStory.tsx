import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import type { SectorStory as SectorStoryType } from '../types'
import { getSectorStory } from '../api/sectors'

export default function SectorStory() {
  const { id } = useParams<{ id: string }>()
  const [story, setStory] = useState<SectorStoryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState(0)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError('')
    getSectorStory(id)
      .then((res) => {
        if (!cancelled) setStory(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Error al cargar la historia')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!story) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = stageRefs.current.findIndex((ref) => ref === entry.target)
            if (idx >= 0) setActiveStage(idx)
          }
        }
      },
      { threshold: 0.5 }
    )

    stageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [story])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400">Cargando historia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400">Historia no encontrada</p>
      </div>
    )
  }

  const activeMetrics = story.stages[activeStage]?.metrics
  const progress = story.stages.length > 0
    ? ((activeStage + 1) / story.stages.length) * 100
    : 0

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="fixed top-4 right-4 z-10 bg-gray-800/80 backdrop-blur rounded-lg p-3 text-sm">
        <p className="text-gray-400">Progreso</p>
        <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
      </div>

      <header className="text-center py-16">
        <h1 className="text-4xl font-bold">{story.sector.name}</h1>
        <p className="text-gray-400 mt-2">{story.sector.climate}</p>
      </header>

      {activeMetrics && (
        <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur border-b border-gray-700">
          <div className="max-w-3xl mx-auto px-4 py-3 flex gap-6 text-sm">
            <span className="text-gray-400">
              Estabilidad: <span className="text-white font-medium">{activeMetrics.stability}</span>
            </span>
            <span className="text-gray-400">
              Energia: <span className="text-white font-medium">{activeMetrics.energy}</span>
            </span>
            <span className="text-gray-400">
              Alertas: <span className="text-white font-medium">{activeMetrics.alerts}</span>
            </span>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {story.stages.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => { stageRefs.current[idx] = el }}
            className={`min-h-[60vh] flex flex-col justify-center py-16 transition-opacity ${
              activeStage === idx ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-8">
              <span className="text-xs text-gray-500 font-mono">Etapa {stage.order + 1}/8</span>
              <h2 className="text-2xl font-bold mt-2">{stage.title}</h2>
              <p className="text-gray-300 mt-4 leading-relaxed">{stage.narrative}</p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Estabilidad</p>
                  <p className="text-xl font-bold text-blue-400">{stage.metrics.stability}</p>
                </div>
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Energia</p>
                  <p className="text-xl font-bold text-green-400">{stage.metrics.energy}</p>
                </div>
                <div className="bg-gray-900 rounded p-3 text-center">
                  <p className="text-xs text-gray-400">Alertas</p>
                  <p className="text-xl font-bold text-red-400">{stage.metrics.alerts}</p>
                </div>
              </div>

              <div
                className="mt-6 h-2 rounded-full"
                style={{ backgroundColor: stage.colorToken === 'emerald' ? '#10b981' : '#6366f1' }}
              />
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center py-8 text-gray-500 text-sm">
        Fin de la historia de {story.sector.name}
      </footer>
    </div>
  )
}
