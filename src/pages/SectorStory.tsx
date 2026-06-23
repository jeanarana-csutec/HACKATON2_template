import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { SectorStory as SectorStoryType } from '../types'
import { getSectorStory } from '../api/sectors'
import { useTransitionNavigate } from '../hooks/useViewTransition'

const COLORS: Record<string, string> = {
  emerald: '#10b981',
  indigo: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
}

function getGradient(colorToken: string): string {
  const c = COLORS[colorToken] ?? '#6366f1'
  return `linear-gradient(135deg, ${c}22 0%, ${c}44 50%, ${c}22 100%)`
}

function getBgColor(colorToken: string): string {
  return COLORS[colorToken] ?? '#6366f1'
}

export default function SectorStory() {
  const { id } = useParams<{ id: string }>()
  const transitionNavigate = useTransitionNavigate()
  const [story, setStory] = useState<SectorStoryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState(0)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const supportsScrollDriven = useRef(false)

  useEffect(() => {
    supportsScrollDriven.current = CSS.supports('animation-timeline', 'scroll()')
  }, [])

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

  const scrollToStage = useCallback((idx: number) => {
    const el = stageRefs.current[idx]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setActiveStage(idx)
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!story) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = Math.min(activeStage + 1, story.stages.length - 1)
      scrollToStage(next)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(activeStage - 1, 0)
      scrollToStage(prev)
    }
  }, [activeStage, story, scrollToStage])

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
  const activeColor = getBgColor(story.stages[activeStage]?.colorToken ?? '')
  const progress = story.stages.length > 0
    ? ((activeStage + 1) / story.stages.length) * 100
    : 0

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 text-white min-h-screen relative"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="fixed inset-0 -z-10 transition-colors duration-700"
        style={{ background: getGradient(story.stages[activeStage]?.colorToken ?? 'indigo') }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute w-64 h-64 rounded-full opacity-20 transition-all duration-1000"
          style={{
            background: activeColor,
            top: '15%',
            left: '10%',
            animation: supportsScrollDriven.current ? 'none' : 'blob-float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-15 transition-all duration-1000"
          style={{
            background: activeColor,
            bottom: '20%',
            right: '15%',
            animation: supportsScrollDriven.current ? 'none' : 'blob-float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-36 h-36 rounded-full opacity-10 transition-all duration-1000"
          style={{
            background: activeColor,
            top: '50%',
            right: '30%',
            animation: supportsScrollDriven.current ? 'none' : 'blob-float 12s ease-in-out infinite 2s',
          }}
        />
      </div>

      <nav className="fixed top-4 right-4 z-20 flex gap-2">
        <div className="bg-gray-800/80 backdrop-blur rounded-lg p-3 text-sm">
          <p className="text-gray-400">Progreso</p>
          <div className="w-24 bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 story-progress-bar"
              style={{
                width: supportsScrollDriven.current ? '100%' : `${progress}%`,
                background: activeColor,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
        </div>
        <button
          onClick={() => transitionNavigate(-1 as unknown as string)}
          className="bg-gray-800/80 backdrop-blur rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Volver"
        >
          &larr;
        </button>
      </nav>

      <header className="text-center py-16 relative">
        <h1 className="text-5xl font-bold">{story.sector.name}</h1>
        <p className="text-gray-400 mt-2 text-lg">{story.sector.climate}</p>
      </header>

      <div
        className="sticky top-0 z-10 backdrop-blur border-b transition-colors duration-500"
        style={{ backgroundColor: `${activeColor}22`, borderColor: `${activeColor}44` }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-6 text-sm">
          <span className="text-gray-400">
            Estabilidad: <span className="text-white font-medium">{activeMetrics?.stability}</span>
          </span>
          <span className="text-gray-400">
            Energia: <span className="text-white font-medium">{activeMetrics?.energy}</span>
          </span>
          <span className="text-gray-400">
            Alertas: <span className="text-white font-medium">{activeMetrics?.alerts}</span>
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8" role="list" aria-label="Etapas de la historia">
        {story.stages.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => { stageRefs.current[idx] = el }}
            className={`min-h-[70vh] flex flex-col justify-center py-20 transition-opacity duration-500 story-stage ${
              activeStage === idx ? 'opacity-100' : 'opacity-40'
            }`}
            role="listitem"
            tabIndex={0}
            aria-current={activeStage === idx ? 'step' : undefined}
            aria-label={`Etapa ${stage.order + 1}: ${stage.title}`}
            onFocus={() => setActiveStage(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                scrollToStage(idx)
              }
            }}
          >
            <div
              className="rounded-xl p-8 backdrop-blur-sm transition-colors duration-500"
              style={{ backgroundColor: `${getBgColor(stage.colorToken)}15`, border: `1px solid ${getBgColor(stage.colorToken)}33` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{ background: `${getBgColor(stage.colorToken)}33`, color: getBgColor(stage.colorToken) }}
                >
                  Etapa {stage.order + 1}/8
                </span>
                <div
                  className="h-1 flex-1 rounded"
                  style={{ background: `linear-gradient(90deg, ${getBgColor(stage.colorToken)} 0%, transparent 100%)` }}
                />
              </div>
              <h2 className="text-3xl font-bold mt-2">{stage.title}</h2>
              <p className="text-gray-300 mt-4 leading-relaxed text-lg">{stage.narrative}</p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div
                  className="rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-500"
                  style={{ backgroundColor: `${getBgColor(stage.colorToken)}22` }}
                >
                  <p className="text-xs text-gray-400">Estabilidad</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: getBgColor(stage.colorToken) }}>
                    {stage.metrics.stability}
                  </p>
                  <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${stage.metrics.stability}%`, background: getBgColor(stage.colorToken) }} />
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-500"
                  style={{ backgroundColor: `${getBgColor(stage.colorToken)}22` }}
                >
                  <p className="text-xs text-gray-400">Energia</p>
                  <p className="text-3xl font-bold mt-1 text-green-400">{stage.metrics.energy}</p>
                  <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${stage.metrics.energy}%` }} />
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-500"
                  style={{ backgroundColor: `${getBgColor(stage.colorToken)}22` }}
                >
                  <p className="text-xs text-gray-400">Alertas</p>
                  <p className="text-3xl font-bold mt-1 text-red-400">{stage.metrics.alerts}</p>
                  <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min(stage.metrics.alerts * 10, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {story.stages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToStage(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              idx === activeStage ? 'scale-125' : ''
            }`}
            style={{
              backgroundColor: idx === activeStage ? activeColor : '#4b5563',
            }}
            aria-label={`Ir a etapa ${idx + 1}`}
          />
        ))}
      </div>

      <footer className="text-center py-16 text-gray-500 text-sm relative">
        Fin de la historia de {story.sector.name}
      </footer>
    </div>
  )
}
