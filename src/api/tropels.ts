import type { Tropel, TropelPage } from '../types'
import apiClient from './client'

export interface TropelParams {
  page?: number
  size?: number
  species?: string
  vitalState?: string
  sectorId?: string
  q?: string
  sort?: string
}

export async function getTropels(params: TropelParams): Promise<TropelPage> {
  const { data } = await apiClient.get<TropelPage>('/tropels', { params })
  return data
}

export async function getTropel(id: string): Promise<Tropel> {
  const { data } = await apiClient.get<Tropel>(`/tropels/${id}`)
  return data
}
