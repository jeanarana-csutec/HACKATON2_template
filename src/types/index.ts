export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY'
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO'
export type SignalType = 'HAMBRE' | 'ABANDONO' | 'MUTACION' | 'FUGA' | 'CONFLICTO' | 'REPRODUCCION_MASIVA' | 'SENAL_CORRUPTA'
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA'
export type Climate = 'PIXEL_FOREST' | 'NEON_CAVE' | 'CLOUD_AQUARIUM' | 'RETRO_ARCADE'

export interface User {
  id: string
  displayName: string
  email: string
  teamCode: string
  role: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: Record<Severity, number>
  generatedAt: string
}

export interface SectorRef {
  id: string
  name: string
  sectorCode: string
}

export interface Tropel {
  id: string
  name: string
  species: Species
  vitalState: VitalState
  energyLevel: number
  chaosIndex: number
  mutationStage: number
  guardianName: string
  sector: SectorRef
  createdAt: string
  updatedAt: string
}

export interface TropelPage {
  content: Tropel[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface TropelRef {
  id: string
  name: string
  species: Species
}

export interface Signal {
  id: string
  signalType: SignalType
  severity: Severity
  status: SignalStatus
  rawContent: string
  tropel: TropelRef
  createdAt: string
  updatedAt: string
}

export interface SignalFeed {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

export interface Sector {
  id: string
  sectorCode: string
  name: string
  climate: Climate
  capacity: number
  currentLoad: number
  stabilityLevel: number
}

export interface StoryMetrics {
  stability: number
  energy: number
  alerts: number
}

export interface SectorStage {
  id: string
  order: number
  title: string
  narrative: string
  dominantEvent: string
  metrics: StoryMetrics
  assetKey: string
  colorToken: string
  progress: number
}

export interface SectorStory {
  sector: {
    id: string
    name: string
    climate: Climate
  }
  stages: SectorStage[]
}

export interface ApiError {
  error: string
  message: string
  timestamp: string
  path: string
  details: Record<string, unknown>
}
