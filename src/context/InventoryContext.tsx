import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  inventoryPositions as seedInventoryPositions,
  movements as seedMovements,
  products as seedProducts,
} from '../data/mockData'
import type {
  InventoryMovement,
  InventoryPosition,
  Product,
} from '../types/logistics'

interface StockEntryInput {
  sku: string
  position: string
  quantity: number
  capacity: number
  responsible: string
  reason: string
}

interface StockWithdrawalInput {
  sku: string
  position: string
  quantity: number
  responsible: string
  reason: string
}

interface InventoryContextValue {
  products: Product[]
  positions: InventoryPosition[]
  movements: InventoryMovement[]
  registerEntry: (input: StockEntryInput) => void
  registerWithdrawal: (input: StockWithdrawalInput) => void
  resetInventoryDemo: () => void
}

const POSITIONS_STORAGE_KEY =
  'logiflow-demo-inventory-positions'

const MOVEMENTS_STORAGE_KEY =
  'logiflow-demo-inventory-movements'

const InventoryContext =
  createContext<InventoryContextValue | null>(null)

function readStorage<T>(
  key: string,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key)

    if (!raw) {
      return fallback
    }

    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function createId(prefix: string) {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function getLocationFromPosition(
  position: string,
) {
  const prefix =
    position.split('-')[0]?.toUpperCase() ?? 'A'

  return {
    street: `Rua ${prefix}`,
    zone:
      prefix === 'A' || prefix === 'B'
        ? 'Zona A'
        : 'Zona B',
  }
}

export function InventoryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [positions, setPositions] =
    useState<InventoryPosition[]>(() =>
      readStorage(
        POSITIONS_STORAGE_KEY,
        seedInventoryPositions,
      ),
    )

  const [movements, setMovements] =
    useState<InventoryMovement[]>(() =>
      readStorage(
        MOVEMENTS_STORAGE_KEY,
        seedMovements,
      ),
    )

  const products = seedProducts

  useEffect(() => {
    localStorage.setItem(
      POSITIONS_STORAGE_KEY,
      JSON.stringify(positions),
    )
  }, [positions])

  useEffect(() => {
    localStorage.setItem(
      MOVEMENTS_STORAGE_KEY,
      JSON.stringify(movements),
    )
  }, [movements])

  function registerEntry(
    input: StockEntryInput,
  ) {
    const product = products.find(
      (item) => item.sku === input.sku,
    )

    if (!product) {
      throw new Error(
        'Selecione um produto válido.',
      )
    }

    const existingPosition =
      positions.find(
        (position) =>
          position.position ===
          input.position,
      )

    if (
      existingPosition &&
      existingPosition.sku !== input.sku
    ) {
      throw new Error(
        `A posição ${input.position} já está ocupada por ${existingPosition.sku}.`,
      )
    }

    const finalCapacity =
      existingPosition?.capacity ??
      input.capacity

    const currentQuantity =
      existingPosition?.quantity ?? 0

    if (
      currentQuantity + input.quantity >
      finalCapacity
    ) {
      throw new Error(
        `A posição suporta no máximo ${finalCapacity} unidades. Há ${currentQuantity} armazenadas atualmente.`,
      )
    }

    if (existingPosition) {
      setPositions((current) =>
        current.map((position) =>
          position.id ===
          existingPosition.id
            ? {
                ...position,
                quantity:
                  position.quantity +
                  input.quantity,
              }
            : position,
        ),
      )
    } else {
      const location =
        getLocationFromPosition(
          input.position,
        )

      const newPosition: InventoryPosition =
        {
          id: createId('pos'),
          zone: location.zone,
          street: location.street,
          position: input.position,
          sku: input.sku,
          quantity: input.quantity,
          capacity: input.capacity,
        }

      setPositions((current) => [
        ...current,
        newPosition,
      ])
    }

    const movement: InventoryMovement = {
      id: createId('mov'),
      sku: input.sku,
      type: 'ENTRADA',
      quantity: input.quantity,
      destination: input.position,
      responsible: input.responsible,
      reason: input.reason,
      createdAt:
        new Date().toISOString(),
    }

    setMovements((current) => [
      movement,
      ...current,
    ])
  }

  function registerWithdrawal(
    input: StockWithdrawalInput,
  ) {
    const existingPosition =
      positions.find(
        (position) =>
          position.position ===
            input.position &&
          position.sku === input.sku,
      )

    if (!existingPosition) {
      throw new Error(
        'Não foi encontrado estoque deste SKU na posição selecionada.',
      )
    }

    if (
      input.quantity >
      existingPosition.quantity
    ) {
      throw new Error(
        `Há apenas ${existingPosition.quantity} unidades disponíveis nesta posição.`,
      )
    }

    const remaining =
      existingPosition.quantity -
      input.quantity

    setPositions((current) => {
      if (remaining === 0) {
        return current.filter(
          (position) =>
            position.id !==
            existingPosition.id,
        )
      }

      return current.map((position) =>
        position.id ===
        existingPosition.id
          ? {
              ...position,
              quantity: remaining,
            }
          : position,
      )
    })

    const movement: InventoryMovement = {
      id: createId('mov'),
      sku: input.sku,
      type: 'SAÍDA',
      quantity: input.quantity,
      origin: input.position,
      responsible: input.responsible,
      reason: input.reason,
      createdAt:
        new Date().toISOString(),
    }

    setMovements((current) => [
      movement,
      ...current,
    ])
  }

  function resetInventoryDemo() {
    setPositions(
      seedInventoryPositions.map(
        (position) => ({
          ...position,
        }),
      ),
    )

    setMovements(
      seedMovements.map(
        (movement) => ({
          ...movement,
        }),
      ),
    )
  }

  const value = useMemo(
    () => ({
      products,
      positions,
      movements,
      registerEntry,
      registerWithdrawal,
      resetInventoryDemo,
    }),
    [positions, movements],
  )

  return (
    <InventoryContext.Provider
      value={value}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context =
    useContext(InventoryContext)

  if (!context) {
    throw new Error(
      'useInventory deve ser utilizado dentro de InventoryProvider.',
    )
  }

  return context
}