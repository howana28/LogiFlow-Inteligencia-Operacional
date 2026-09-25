export type ProductCategory =
  | 'Eletrônicos'
  | 'Acessórios'
  | 'Vestuário'
  | 'Escritório'

export type StockStatus =
  | 'Disponível'
  | 'Estoque baixo'
  | 'Indisponível'

export type MovementType =
  | 'ENTRADA'
  | 'SAÍDA'
  | 'TRANSFERÊNCIA'

export type UserStatus =
  | 'ATIVO'
  | 'INATIVO'

export type UserRole =
  | 'Administrador'
  | 'Analista'
  | 'Operador de Estoque'
  | 'Conferente'

export type ReturnConferenceOutcome =
  | 'REINTEGRADO'
  | 'NAO_REINTEGRADO'

export interface Product {
  id: string
  sku: string
  name: string
  category: ProductCategory
  brand: string
  unitCost: number
  minimumStock: number
}

export interface InventoryPosition {
  id: string
  zone: string
  street: string
  position: string
  sku: string
  quantity: number
  capacity: number
}

export interface InventoryMovement {
  id: string
  sku: string
  type: MovementType
  quantity: number
  origin?: string
  destination?: string
  responsible: string
  reason: string
  createdAt: string
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  permissions: string[]
}

export interface ReturnRecord {
  id: string
  orderNumber: string
  sku: string
  quantity: number
  reason: string
  status:
    | 'A revisar'
    | 'Em conferência'
    | 'Finalizada'
  createdAt: string
  conferenceOutcome?: ReturnConferenceOutcome
  conferencePosition?: string
  conferenceQuantity?: number
  conferenceResponsible?: string
  conferenceNote?: string
  conferenceAt?: string
}

export interface ReceivingItemLine {
  id: string
  sku: string
  expectedQuantity: number
  receivedQuantity?: number
  position?: string
}

export interface ReceivingRecord {
  id: string
  supplier: string
  expectedDate: string
  items: number
  units: number
  status:
    | 'A caminho'
    | 'Em conferência'
    | 'Processado'
  purchaseNumber?: string
  createdAt?: string
  responsible?: string
  lines?: ReceivingItemLine[]
  conferenceStartedAt?: string
  conferenceFinishedAt?: string
  receivedUnits?: number
  discrepancyCount?: number
  notes?: string
}
