import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  returns as seedReturns,
} from '../data/mockData'
import type {
  ReturnConferenceOutcome,
  ReturnRecord,
} from '../types/logistics'

interface CreateReturnInput {
  orderNumber: string
  sku: string
  quantity: number
  reason: string
}

interface FinalizeReturnInput {
  outcome: ReturnConferenceOutcome
  position?: string
  quantity?: number
  responsible: string
  note?: string
}

interface ReturnsContextValue {
  returns: ReturnRecord[]
  createReturn: (
    input: CreateReturnInput,
  ) => ReturnRecord
  updateReturnStatus: (
    id: string,
    status: ReturnRecord['status'],
  ) => void
  finalizeReturn: (
    id: string,
    input: FinalizeReturnInput,
  ) => void
  resetReturnsDemo: () => void
}

const RETURNS_STORAGE_KEY =
  'logiflow-demo-returns'

const ReturnsContext =
  createContext<ReturnsContextValue | null>(
    null,
  )

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

function createId() {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return `dev-${crypto.randomUUID()}`
  }

  return `dev-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

export function ReturnsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [returns, setReturns] =
    useState<ReturnRecord[]>(() =>
      readStorage(
        RETURNS_STORAGE_KEY,
        seedReturns,
      ),
    )

  useEffect(() => {
    localStorage.setItem(
      RETURNS_STORAGE_KEY,
      JSON.stringify(returns),
    )
  }, [returns])

  function createReturn(
    input: CreateReturnInput,
  ) {
    if (!input.orderNumber.trim()) {
      throw new Error(
        'Informe o número do pedido.',
      )
    }

    if (!input.sku) {
      throw new Error(
        'Selecione o produto devolvido.',
      )
    }

    if (
      !input.quantity ||
      input.quantity <= 0
    ) {
      throw new Error(
        'Informe uma quantidade válida.',
      )
    }

    if (!input.reason.trim()) {
      throw new Error(
        'Informe o motivo da devolução.',
      )
    }

    const record: ReturnRecord = {
      id: createId(),
      orderNumber:
        input.orderNumber.trim(),
      sku: input.sku,
      quantity: input.quantity,
      reason: input.reason.trim(),
      status: 'A revisar',
      createdAt:
        new Date().toISOString(),
    }

    setReturns((current) => [
      record,
      ...current,
    ])

    return record
  }

  function updateReturnStatus(
    id: string,
    status: ReturnRecord['status'],
  ) {
    setReturns((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status,
            }
          : record,
      ),
    )
  }

  function finalizeReturn(
    id: string,
    input: FinalizeReturnInput,
  ) {
    if (!input.responsible.trim()) {
      throw new Error(
        'Informe o responsável pela conferência.',
      )
    }

    if (
      input.outcome === 'REINTEGRADO' &&
      (!input.position ||
        !input.quantity ||
        input.quantity <= 0)
    ) {
      throw new Error(
        'Informe a posição e a quantidade reintegrada.',
      )
    }

    setReturns((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: 'Finalizada',
              conferenceOutcome:
                input.outcome,
              conferencePosition:
                input.position,
              conferenceQuantity:
                input.quantity ?? 0,
              conferenceResponsible:
                input.responsible.trim(),
              conferenceNote:
                input.note?.trim() || undefined,
              conferenceAt:
                new Date().toISOString(),
            }
          : record,
      ),
    )
  }

  function resetReturnsDemo() {
    setReturns(
      seedReturns.map((record) => ({
        ...record,
      })),
    )
  }

  const value = useMemo(
    () => ({
      returns,
      createReturn,
      updateReturnStatus,
      finalizeReturn,
      resetReturnsDemo,
    }),
    [returns],
  )

  return (
    <ReturnsContext.Provider
      value={value}
    >
      {children}
    </ReturnsContext.Provider>
  )
}

export function useReturns() {
  const context =
    useContext(ReturnsContext)

  if (!context) {
    throw new Error(
      'useReturns deve ser utilizado dentro de ReturnsProvider.',
    )
  }

  return context
}
