import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { SectorStory as SectorStoryType, SectorStage } from '../types'
import { getSectorStory } from '../api/sectors'

const COLOR_MAP: Record<string, string> = {
  emerald: '#10b981',
  indigo: '#6366f1',
  rose: '#f43f5e',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  fuchsia: '#d946ef',
}

function resolveColor(token: string): string {
  return COLOR_MAP[token.toLowerCase()] ?? '#6366f1'
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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
      .then((res) => { if (!cancelled) setStory(res) })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Object && 'response' in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : undefined
          setError(msg || 'Error al cargar la historia')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  // IntersectionObserver to track active stage
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
      { threshold: 0.4 }
    )
    stageRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [story])

  const navigateStage = useCallback(
    (direction: 1 | -1) => {
      if (!story) return
      const next = activeStage + direction
      if (next < 0 || next >= story.stages.length) return
      setActiveStage(next)
      stageRefs.current[next]?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'instant' : 'smooth',
        block: 'center',
      })
    },
    [activeStage, story]
  )

  // Keyboard navigation: Arrow keys move between stages
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        navigateStage(1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateStage(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigateStage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400">Cargando historia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded max-w-md w-full">
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

  const activeStageData: SectorStage | undefined = story.stages[activeStage]
  const activeColor = resolveColor(activeStageData?.colorToken ?? '')
  const progress = story.stages.length > 0 ? ((activeStage + 1) / story.stages.length) * 100 : 0

  return (
    <div
      className="bg-gray-900 text-white min-h-screen"
      aria-label={`Historia del sector ${story.sector.name}`}
    >
      {/* CSS scroll-driven animations + prefers-reduced-motion override */}
      <style>{`
        @supports (animation-timeline: view()) {
          @media not all and (prefers-reduced-motion: reduce) {
            .story-stage {
              animation: stage-reveal linear both;
              animation-timeline: view();
              animation-range: entry 0% entry 50%;
            }
            @keyframes stage-reveal {
              from { opacity: 0.15; transform: translateY(32px); }
              to   { opacity: 1;    transform: translateY(0); }
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .story-stage { opacity: 1 !important; transform: none !important; }
          .motion-transition { transition: none !important; }
        }
        @supports (view-transition-name: none) {
          .vt-sector-title { view-transition-name: sector-title; }
        }
      `}</style>

      {/* Progress indicator (fixed top-right) */}
      <div
        className="fixed top-4 right-4 z-20 bg-gray-800/90 backdrop-blur rounded-lg p-3 text-sm shadow-lg"
        aria-live="polite"
        aria-label={`Etapa ${activeStage + 1} de ${story.stages.length}`}
      >
        <p className="text-gray-400 text-xs mb-1">Progreso</p>
        <div className="w-24 bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full motion-transition"
            style={{
              width: `${progress}%`,
              backgroundColor: activeColor,
              transition: 'width 0.5s ease, background-color 0.7s ease',
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{activeStage + 1} / {story.stages.length}</p>
      </div>

      {/* Sticky visual panel (changes with active stage) */}
      <div
        className="sticky top-0 z-10 border-b motion-transition"
        style={{
          backgroundColor: activeColor + '20',
          borderColor: activeColor + '50',
          transition: 'background-color 0.7s ease, border-color 0.7s ease',
        }}
        aria-hidden="true"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
          <div
            className="w-3 h-3 rounded-full shrink-0 motion-transition"
            style={{ backgroundColor: activeColor, transition: 'background-color 0.7s ease' }}
          />
          <span className="text-sm font-medium text-gray-300 truncate">
            {story.sector.name}
          </span>
          {activeStageData && (
            <div className="flex gap-4 text-sm ml-auto flex-wrap">
              <span className="text-gray-400">
                Estabilidad: <strong style={{ color: activeColor }}>{activeStageData.metrics.stability}</strong>
              </span>
              <span className="text-gray-400">
                Energia: <strong style={{ color: activeColor }}>{activeStageData.metrics.energy}</strong>
              </span>
              <span className="text-gray-400">
                Alertas: <strong className="text-red-400">{activeStageData.metrics.alerts}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Header / Summary */}
      <header className="text-center py-20 px-4">
        <h1 className="text-4xl font-bold vt-sector-title">{story.sector.name}</h1>
        <p className="text-gray-400 mt-2 text-lg">{story.sector.climate}</p>
        <p className="text-gray-500 text-sm mt-6">
          Usa <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">↑</kbd>{' '}
          <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">↓</kbd>{' '}
          o desplazate para navegar la historia
        </p>
      </header>

      {/* Scrollytelling layout: sticky visual (desktop) + scrollable stages */}
      <div className="max-w-5xl mx-auto px-4 pb-16 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-10 lg:items-start">

        {/* Persistent visual panel (sticky on desktop) */}
        <div className="hidden lg:block lg:sticky lg:top-16" aria-hidden="true">
          <div
            className="rounded-xl p-6 border motion-transition"
            style={{
              backgroundColor: activeColor + '18',
              borderColor: activeColor + '60',
              transition: 'background-color 0.7s ease, border-color 0.7s ease',
            }}
          >
            {activeStageData && (
              <>
                <p className="text-xs font-mono text-gray-500 mb-1">
                  Etapa {activeStageData.order + 1} / {story.stages.length}
                </p>
                <p
                  className="text-sm font-semibold mb-2 motion-transition"
                  style={{ color: activeColor, transition: 'color 0.7s ease' }}
                >
                  {activeStageData.dominantEvent}
                </p>
                <h2 className="text-xl font-bold mb-4">{activeStageData.title}</h2>

                <div className="space-y-3">
                  {(['stability', 'energy', 'alerts'] as const).map((key) => {
                    const labels = { stability: 'Estabilidad', energy: 'Energia', alerts: 'Alertas' }
                    const val = activeStageData.metrics[key]
                    const pct = key === 'alerts' ? Math.min(val * 10, 100) : val
                    const barColor = key === 'alerts' ? '#f43f5e' : activeColor
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{labels[key]}</span>
                          <strong style={{ color: barColor }}>{val}</strong>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full motion-transition"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: barColor,
                              transition: 'width 0.6s ease, background-color 0.7s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Stage navigation dots */}
                <div className="flex gap-1.5 mt-6 flex-wrap">
                  {story.stages.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Ir a etapa ${idx + 1}`}
                      onClick={() => {
                        setActiveStage(idx)
                        stageRefs.current[idx]?.scrollIntoView({
                          behavior: prefersReducedMotion() ? 'instant' : 'smooth',
                          block: 'center',
                        })
                      }}
                      className="w-2.5 h-2.5 rounded-full motion-transition focus:outline-none focus:ring-2 focus:ring-white"
                      style={{
                        backgroundColor: idx === activeStage ? activeColor : '#374151',
                        transition: 'background-color 0.4s ease',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable stages column */}
        <div>
          {story.stages.map((stage: SectorStage, idx: number) => {
            const stageColor = resolveColor(stage.colorToken)
            const isActive = activeStage === idx
            return (
              <div
                key={stage.id}
                ref={(el) => { stageRefs.current[idx] = el }}
                tabIndex={0}
                aria-label={`Etapa ${stage.order + 1}: ${stage.title}`}
                onFocus={() => setActiveStage(idx)}
                className="story-stage min-h-[70vh] lg:min-h-[60vh] flex flex-col justify-center py-16 focus:outline-none"
                style={{ opacity: isActive ? 1 : 0.35, transition: 'opacity 0.5s ease' }}
              >
                {/* Mobile-only mini visual */}
                <div className="lg:hidden mb-4 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
                  <span className="text-xs font-medium" style={{ color: stageColor }}>
                    {stage.dominantEvent}
                  </span>
                </div>

                <div
                  className="rounded-lg p-6 border-l-4"
                  style={{ borderColor: stageColor, backgroundColor: isActive ? stageColor + '10' : 'transparent' }}
                >
                  <span className="text-xs text-gray-500 font-mono">
                    Etapa {stage.order + 1} de {story.stages.length}
                  </span>
                  <h2 className="text-2xl font-bold mt-2">{stage.title}</h2>
                  <p className="text-gray-300 mt-4 leading-relaxed">{stage.narrative}</p>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="bg-gray-900/70 rounded p-3 text-center">
                      <p className="text-xs text-gray-400">Estabilidad</p>
                      <p className="text-xl font-bold" style={{ color: stageColor }}>
                        {stage.metrics.stability}
                      </p>
                    </div>
                    <div className="bg-gray-900/70 rounded p-3 text-center">
                      <p className="text-xs text-gray-400">Energia</p>
                      <p className="text-xl font-bold text-green-400">{stage.metrics.energy}</p>
                    </div>
                    <div className="bg-gray-900/70 rounded p-3 text-center">
                      <p className="text-xs text-gray-400">Alertas</p>
                      <p className="text-xl font-bold text-red-400">{stage.metrics.alerts}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: stageColor }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="text-center py-10 text-gray-500 text-sm border-t border-gray-800">
        Fin de la historia de {story.sector.name}
      </footer>
    </div>
  )
}
