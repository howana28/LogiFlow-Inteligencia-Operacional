import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  receivingRecords as seedReceivingRecords,
} from '../data/mockData'
import type {
  ReceivingItemLine,
  ReceivingRecord,
} from '../types/logistics'

interface CreateReceivingInput {
  supplier: string
  purchaseNumber: string
  expectedDate: string
  responsible: string
  lines: Array<{
    sku: string
    expectedQuantity: number
  }>
}

interface FinalizeReceivingInput {
  lines: Array<{
    id: string
    receivedQuantity: number
    position: string
  }>
  responsible: string
  notes?: string
}

interface ReceivingContextValue {
  receivingRecords: ReceivingRecord[]
  createReceiving: (
    input: CreateReceivingInput,
  ) => ReceivingRecord
  startConference: (
    id: string,
    responsible: string,
  ) => void
  finalizeReceiving: (
    id: string,
    input: FinalizeReceivingInput,
  ) => void
  resetReceivingDemo: () => void
}

const RECEIVING_STORAGE_KEY =
  'logiflow-demo-receiving'

const ReceivingContext =
  createContext<ReceivingContextValue | null>(
    null,
  )

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

function seedLinesFor(
  record: ReceivingRecord,
): ReceivingItemLine[] {
  if (record.lines?.length) {
    return record.lines
  }

  const known: Record<
    string,
    Array<[string, number]>
  > = {
    'rec-001': [
      ['ELT-1002', 40],
      ['ACE-2001', 30],
      ['VST-3001', 30],
      ['ESC-4002', 20],
    ],
    'rec-002': [
      ['ELT-1003', 18],
      ['VST-3002', 30],
      ['ESC-4001', 30],
    ],
    'rec-003': [
      ['ELT-1004', 30],
      ['ACE-2002', 40],
      ['VST-3001', 60],
      ['ESC-4001', 35],
      ['ESC-4002', 45],
    ],
  }

  const source =
    known[record.id] ?? [
      ['ELT-1001', record.units],
    ]

  return source.map(
    ([sku, expectedQuantity], index) => ({
      id: `${record.id}-line-${index + 1}`,
      sku,
      expectedQuantity,
      receivedQuantity:
        record.status === 'Processado'
          ? expectedQuantity
          : undefined,
    }),
  )
}

function normalizeSeed(
  records: ReceivingRecord[],
) {
  return records.map((record) => ({
    ...record,
    purchaseNumber:
      record.purchaseNumber ??
      `OC-${record.id
        .replace('rec-', '')
        .padStart(4, '0')}`,
    createdAt:
      record.createdAt ??
      `${record.expectedDate}T09:00:00`,
    responsible:
      record.responsible ??
      'Lucas Martins',
    lines: seedLinesFor(record),
    receivedUnits:
      record.receivedUnits ??
      (record.status === 'Processado'
        ? record.units
        : undefined),
    discrepancyCount:
      record.discrepancyCount ??
      (record.status === 'Processado'
        ? 0
        : undefined),
  }))
}

const normalizedSeed =
  normalizeSeed(seedReceivingRecords)

export function ReceivingProvider({
  children,
}: {
  children: ReactNode
}) {
  const [
    receivingRecords,
    setReceivingRecords,
  ] = useState<ReceivingRecord[]>(() =>
    readStorage(
      RECEIVING_STORAGE_KEY,
      normalizedSeed,
    ),
  )

  useEffect(() => {
    localStorage.setItem(
      RECEIVING_STORAGE_KEY,
      JSON.stringify(receivingRecords),
    )
  }, [receivingRecords])

  function createReceiving(
    input: CreateReceivingInput,
  ) {
    if (!input.supplier.trim()) {
      throw new Error(
        'Informe o fornecedor.',
      )
    }

    if (!input.purchaseNumber.trim()) {
      throw new Error(
        'Informe a ordem de compra.',
      )
    }

    if (!input.expectedDate) {
      throw new Error(
        'Informe a data prevista.',
      )
    }

    if (!input.responsible.trim()) {
      throw new Error(
        'Informe o responsável.',
      )
    }

    if (input.lines.length === 0) {
      throw new Error(
        'Adicione pelo menos um item ao recebimento.',
      )
    }

    const uniqueSkus =
      new Set(
        input.lines.map(
          (line) => line.sku,
        ),
      )

    if (
      uniqueSkus.size !==
      input.lines.length
    ) {
      throw new Error(
        'O mesmo SKU não pode aparecer duas vezes na ordem.',
      )
    }

    if (
      input.lines.some(
        (line) =>
          !line.sku ||
          !line.expectedQuantity ||
          line.expectedQuantity <= 0,
      )
    ) {
      throw new Error(
        'Revise os itens e as quantidades esperadas.',
      )
    }

    const lines: ReceivingItemLine[] =
      input.lines.map((line) => ({
        id: createId('rec-line'),
        sku: line.sku,
        expectedQuantity:
          line.expectedQuantity,
      }))

    const record: ReceivingRecord = {
      id: createId('rec'),
      supplier: input.supplier.trim(),
      purchaseNumber:
        input.purchaseNumber.trim(),
      expectedDate:
        input.expectedDate,
      items: lines.length,
      units: lines.reduce(
        (sum, line) =>
          sum + line.expectedQuantity,
        0,
      ),
      status: 'A caminho',
      responsible:
        input.responsible.trim(),
      lines,
      createdAt:
        new Date().toISOString(),
    }

    setReceivingRecords((current) => [
      record,
      ...current,
    ])

    return record
  }

  function startConference(
    id: string,
    responsible: string,
  ) {
    if (!responsible.trim()) {
      throw new Error(
        'Informe o responsável pela conferência.',
      )
    }

    setReceivingRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: 'Em conferência',
              responsible:
                responsible.trim(),
              conferenceStartedAt:
                new Date().toISOString(),
            }
          : record,
      ),
    )
  }

  function finalizeReceiving(
    id: string,
    input: FinalizeReceivingInput,
  ) {
    if (!input.responsible.trim()) {
      throw new Error(
        'Informe o responsável pela conferência.',
      )
    }

    const record =
      receivingRecords.find(
        (item) => item.id === id,
      )

    if (!record) {
      throw new Error(
        'Recebimento não encontrado.',
      )
    }

    const sourceLines =
      record.lines ?? []

    if (
      sourceLines.length === 0 ||
      input.lines.length !==
        sourceLines.length
    ) {
      throw new Error(
        'A conferência deve contemplar todos os itens da ordem.',
      )
    }

    const updatedLines =
      sourceLines.map((line) => {
        const checked =
          input.lines.find(
            (item) =>
              item.id === line.id,
          )

        if (!checked) {
          throw new Error(
            `O SKU ${line.sku} ainda não foi conferido.`,
          )
        }

        if (
          checked.receivedQuantity < 0
        ) {
          throw new Error(
            'A quantidade recebida não pode ser negativa.',
          )
        }

        if (
          checked.receivedQuantity > 0 &&
          !checked.position
        ) {
          throw new Error(
            `Selecione uma posição para o SKU ${line.sku}.`,
          )
        }

        return {
          ...line,
          receivedQuantity:
            checked.receivedQuantity,
          position:
            checked.receivedQuantity > 0
              ? checked.position
              : undefined,
        }
      })

    const receivedUnits =
      updatedLines.reduce(
        (sum, line) =>
          sum +
          (line.receivedQuantity ?? 0),
        0,
      )

    const discrepancyCount =
      updatedLines.filter(
        (line) =>
          line.receivedQuantity !==
          line.expectedQuantity,
      ).length

    setReceivingRecords((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Processado',
              lines: updatedLines,
              responsible:
                input.responsible.trim(),
              receivedUnits,
              discrepancyCount,
              notes:
                input.notes?.trim() ||
                undefined,
              conferenceFinishedAt:
                new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  function resetReceivingDemo() {
    setReceivingRecords(
      normalizedSeed.map(
        (record) => ({
          ...record,
          lines: record.lines?.map(
            (line) => ({
              ...line,
            }),
          ),
        }),
      ),
    )
  }

  const value = useMemo(
    () => ({
      receivingRecords,
      createReceiving,
      startConference,
      finalizeReceiving,
      resetReceivingDemo,
    }),
    [receivingRecords],
  )

  return (
    <ReceivingContext.Provider
      value={value}
    >
      {children}
    </ReceivingContext.Provider>
  )
}

export function useReceiving() {
  const context =
    useContext(ReceivingContext)

  if (!context) {
    throw new Error(
      'useReceiving deve ser utilizado dentro de ReceivingProvider.',
    )
  }

  return context
}
