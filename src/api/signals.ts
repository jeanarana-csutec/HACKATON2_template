import type { Signal, SignalFeed, SignalStatus } from '../types'
import apiClient from './client'

export interface SignalFeedParams {
  cursor?: string
  limit?: number
  signalType?: string
  severity?: string
  status?: string
  q?: string
}

export async function getSignalFeed(params: SignalFeedParams): Promise<SignalFeed> {
  const { data } = await apiClient.get<SignalFeed>('/signals/feed', { params })
  return data
}

export async function getSignal(id: string): Promise<Signal> {
  const { data } = await apiClient.get<Signal>(`/signals/${id}`)
  return data
}

export async function updateSignalStatus(id: string, status: SignalStatus): Promise<Signal> {
  const { data } = await apiClient.patch<Signal>(`/signals/${id}/status`, { status })
  return data
}
