import { useCallback } from 'react'
import { useNavigate, type NavigateOptions } from 'react-router-dom'

export function useTransitionNavigate() {
  const navigate = useNavigate()

  const transitionNavigate = useCallback((to: string, opts?: NavigateOptions) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate(to, opts))
    } else {
      navigate(to, opts)
    }
  }, [navigate])

  return transitionNavigate
}
