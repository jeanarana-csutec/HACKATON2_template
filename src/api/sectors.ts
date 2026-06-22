import type { Sector, SectorStory } from '../types'
import apiClient from './client'

export async function getSectors(): Promise<{ items: Sector[] }> {
  const { data } = await apiClient.get<{ items: Sector[] }>('/sectors')
  return data
}

export async function getSectorStory(id: string): Promise<SectorStory> {
  const { data } = await apiClient.get<SectorStory>(`/sectors/${id}/story`)
  return data
}
