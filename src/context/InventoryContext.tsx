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

interface StockTransferInput {
  sku: string
  origin: string
  destination: string
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
  registerTransfer: (input: StockTransferInput) => void
  resetInventoryDemo: () => void
}

const POSITIONS_STORAGE_KEY =
  'logiflow-demo-inventory-positions'

const MOVEMENTS_STORAGE_KEY =
  'logiflow-demo-inventory-movements'

const DEFAULT_POSITION_CAPACITY = 60

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

  function registerTransfer(
    input: StockTransferInput,
  ) {
    if (
      !input.quantity ||
      input.quantity <= 0
    ) {
      throw new Error(
        'Informe uma quantidade válida para transferência.',
      )
    }

    if (
      input.origin === input.destination
    ) {
      throw new Error(
        'A posição de destino deve ser diferente da origem.',
      )
    }

    const product = products.find(
      (item) => item.sku === input.sku,
    )

    if (!product) {
      throw new Error(
        'Produto não encontrado.',
      )
    }

    const originPosition =
      positions.find(
        (position) =>
          position.position ===
            input.origin &&
          position.sku === input.sku,
      )

    if (!originPosition) {
      throw new Error(
        'A posição de origem não possui este SKU.',
      )
    }

    if (
      input.quantity >
      originPosition.quantity
    ) {
      throw new Error(
        `Há apenas ${originPosition.quantity} unidades disponíveis na origem.`,
      )
    }

    const destinationPosition =
      positions.find(
        (position) =>
          position.position ===
          input.destination,
      )

    if (
      destinationPosition &&
      destinationPosition.sku !== input.sku
    ) {
      throw new Error(
        `A posição ${input.destination} já está ocupada por ${destinationPosition.sku}.`,
      )
    }

    const destinationCapacity =
      destinationPosition?.capacity ??
      DEFAULT_POSITION_CAPACITY

    const destinationQuantity =
      destinationPosition?.quantity ?? 0

    if (
      destinationQuantity +
        input.quantity >
      destinationCapacity
    ) {
      const available =
        destinationCapacity -
        destinationQuantity

      throw new Error(
        `A posição ${input.destination} comporta apenas mais ${available} unidades.`,
      )
    }

    setPositions((current) => {
      const origin =
        current.find(
          (position) =>
            position.position ===
              input.origin &&
            position.sku === input.sku,
        )

      if (!origin) {
        return current
      }

      const destination =
        current.find(
          (position) =>
            position.position ===
            input.destination,
        )

      const remainingOrigin =
        origin.quantity -
        input.quantity

      let next = current
        .map((position) => {
          if (
            position.id === origin.id
          ) {
            return {
              ...position,
              quantity:
                remainingOrigin,
            }
          }

          if (
            destination &&
            position.id ===
              destination.id
          ) {
            return {
              ...position,
              quantity:
                position.quantity +
                input.quantity,
            }
          }

          return position
        })
        .filter(
          (position) =>
            position.quantity > 0,
        )

      if (!destination) {
        const location =
          getLocationFromPosition(
            input.destination,
          )

        next = [
          ...next,
          {
            id: createId('pos'),
            zone: location.zone,
            street: location.street,
            position:
              input.destination,
            sku: input.sku,
            quantity:
              input.quantity,
            capacity:
              DEFAULT_POSITION_CAPACITY,
          },
        ]
      }

      return next
    })

    const movement: InventoryMovement = {
      id: createId('mov'),
      sku: input.sku,
      type: 'TRANSFERÊNCIA',
      quantity: input.quantity,
      origin: input.origin,
      destination:
        input.destination,
      responsible:
        input.responsible,
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
      registerTransfer,
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
