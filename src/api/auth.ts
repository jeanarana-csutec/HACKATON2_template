import type { AuthResponse, User } from '../types'
import apiClient from './client'

export async function login(teamCode: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { teamCode, email, password })
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}
