import {
  CheckCircle2,
  ClipboardCheck,
  Search,
  X,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useInventory } from '../context/InventoryContext'
import { useReceiving } from '../context/ReceivingContext'
import type {
  ReceivingRecord,
} from '../types/logistics'
import './Recebimento.css'

const positionCodes = [
  'A-01',
  'A-02',
  'A-03',
  'A-04',
  'A-05',
  'A-06',
  'B-01',
  'B-02',
  'B-03',
  'B-04',
  'B-05',
  'B-06',
  'C-01',
  'C-02',
  'C-03',
  'C-04',
  'C-05',
  'C-06',
  'D-01',
  'D-02',
  'D-03',
  'D-04',
  'D-05',
  'D-06',
]

const DEFAULT_POSITION_CAPACITY = 60

interface CheckedLine {
  id: string
  sku: string
  expectedQuantity: number
  receivedQuantity: string
  position: string
}

export function ConferenciaRecebimento() {
  const {
    products,
    positions,
    registerEntry,
  } = useInventory()

  const {
    receivingRecords,
    finalizeReceiving,
  } = useReceiving()

  const [search, setSearch] =
    useState('')

  const [
    selectedRecord,
    setSelectedRecord,
  ] = useState<ReceivingRecord | null>(
    null,
  )

  const [checkedLines, setCheckedLines] =
    useState<CheckedLine[]>([])

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [notes, setNotes] =
    useState('')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const queue = useMemo(
    () =>
      receivingRecords.filter(
        (record) =>
          record.status ===
          'Em conferência',
      ),
    [receivingRecords],
  )

  const filteredQueue = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    if (!term) {
      return queue
    }

    return queue.filter(
      (record) =>
        record.supplier
          .toLowerCase()
          .includes(term) ||
        record.purchaseNumber
          ?.toLowerCase()
          .includes(term) ||
        record.lines?.some((line) =>
          line.sku
            .toLowerCase()
            .includes(term),
        ),
    )
  }, [queue, search])

  function productName(sku: string) {
    return (
      products.find(
        (product) =>
          product.sku === sku,
      )?.name ?? sku
    )
  }

  function openConference(
    record: ReceivingRecord,
  ) {
    setSelectedRecord(record)

    setCheckedLines(
      (record.lines ?? []).map(
        (line) => ({
          id: line.id,
          sku: line.sku,
          expectedQuantity:
            line.expectedQuantity,
          receivedQuantity: String(
            line.expectedQuantity,
          ),
          position: '',
        }),
      ),
    )

    setResponsible(
      record.responsible ??
        'Ana Mendes',
    )

    setNotes('')
    setMessage(null)
  }

  function updateLine(
    id: string,
    field:
      | 'receivedQuantity'
      | 'position',
    value: string,
  ) {
    setCheckedLines((current) =>
      current.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: value,
            }
          : line,
      ),
    )

    setMessage(null)
  }

  function availablePositions(
    sku: string,
  ) {
    return positionCodes.filter(
      (code) => {
        const current =
          positions.find(
            (position) =>
              position.position ===
              code,
          )

        return (
          !current ||
          current.sku === sku
        )
      },
    )
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (!selectedRecord) {
      return
    }

    const normalized =
      checkedLines.map((line) => ({
        ...line,
        receivedQuantity: Number(
          line.receivedQuantity,
        ),
      }))

    if (
      normalized.some(
        (line) =>
          Number.isNaN(
            line.receivedQuantity,
          ) ||
          line.receivedQuantity < 0,
      )
    ) {
      setMessage({
        type: 'error',
        text: 'Revise as quantidades recebidas.',
      })
      return
    }

    const positiveLines =
      normalized.filter(
        (line) =>
          line.receivedQuantity > 0,
      )

    if (
      positiveLines.some(
        (line) => !line.position,
      )
    ) {
      setMessage({
        type: 'error',
        text: 'Selecione a posição de destino de todos os itens recebidos.',
      })
      return
    }

    const duplicatedPositions =
      positiveLines
        .map((line) => line.position)
        .filter(
          (position, index, array) =>
            array.indexOf(position) !==
            index,
        )

    if (
      duplicatedPositions.length > 0
    ) {
      setMessage({
        type: 'error',
        text: 'Use uma posição diferente para cada SKU nesta conferência.',
      })
      return
    }

    try {
      positiveLines.forEach(
        (line) => {
          const currentPosition =
            positions.find(
              (position) =>
                position.position ===
                line.position,
            )

          registerEntry({
            sku: line.sku,
            position: line.position,
            quantity:
              line.receivedQuantity,
            capacity:
              currentPosition?.capacity ??
              DEFAULT_POSITION_CAPACITY,
            responsible:
              responsible.trim(),
            reason: `Recebimento ${selectedRecord.purchaseNumber ?? selectedRecord.id} · ${selectedRecord.supplier}`,
          })
        },
      )

      finalizeReceiving(
        selectedRecord.id,
        {
          lines: normalized.map(
            (line) => ({
              id: line.id,
              receivedQuantity:
                line.receivedQuantity,
              position: line.position,
            }),
          ),
          responsible,
          notes,
        },
      )

      const divergenceCount =
        normalized.filter(
          (line) =>
            line.receivedQuantity !==
            line.expectedQuantity,
        ).length

      setMessage({
        type: 'success',
        text:
          divergenceCount > 0
            ? `Recebimento processado com ${divergenceCount} divergência(s). O estoque foi atualizado com as quantidades conferidas.`
            : 'Recebimento processado sem divergências. O estoque foi atualizado.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível concluir a conferência.',
      })
    }
  }

  return (
    <section className="receiving-page">
      <div className="receiving-heading">
        <div>
          <span className="page-eyebrow">
            CONFERÊNCIA
          </span>

          <h1>
            Conferência de recebimento
          </h1>

          <p className="page-description">
            Compare previsto x recebido,
            registre divergências e
            enderece os itens aprovados.
          </p>
        </div>

        <div className="receiving-conference-summary">
          <span>
            Aguardando conferência
          </span>

          <strong>
            {queue.length}
          </strong>
        </div>
      </div>

      <div className="receiving-search">
        <Search size={16} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Buscar ordem, fornecedor ou SKU"
        />
      </div>

      <div className="receiving-card">
        <div className="receiving-card-header">
          <div>
            <strong>
              Fila de conferência
            </strong>

            <span>
              {filteredQueue.length}{' '}
              cargas aguardando validação
            </span>
          </div>
        </div>

        {filteredQueue.length > 0 ? (
          <div className="receiving-conference-list">
            {filteredQueue.map(
              (record) => (
                <button
                  key={record.id}
                  type="button"
                  className="receiving-conference-item"
                  onClick={() =>
                    openConference(
                      record,
                    )
                  }
                >
                  <div className="receiving-conference-icon">
                    <ClipboardCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <strong>
                      {
                        record.purchaseNumber
                      }
                    </strong>

                    <span>
                      {record.supplier}
                    </span>
                  </div>

                  <div className="receiving-conference-meta">
                    <strong>
                      {record.items}{' '}
                      SKUs
                    </strong>

                    <span>
                      {record.units} un.
                      previstas
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="receiving-empty receiving-empty-large">
            <CheckCircle2 size={24} />

            <strong>
              Fila concluída
            </strong>

            <span>
              Nenhuma carga aguarda
              conferência.
            </span>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div
          className="receiving-modal-backdrop"
          onMouseDown={() =>
            setSelectedRecord(null)
          }
        >
          <div
            className="receiving-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="receiving-modal-close"
              onClick={() =>
                setSelectedRecord(null)
              }
              aria-label="Fechar conferência"
            >
              <X size={19} />
            </button>

            <div className="receiving-modal-header">
              <div className="receiving-modal-icon">
                <ClipboardCheck
                  size={20}
                />
              </div>

              <span>
                {
                  selectedRecord.purchaseNumber
                }
              </span>

              <h2>
                Conferir recebimento
              </h2>

              <p>
                {
                  selectedRecord.supplier
                }{' '}
                · {selectedRecord.units}{' '}
                unidades previstas
              </p>
            </div>

            <form
              className="receiving-conference-form"
              onSubmit={handleSubmit}
            >
              <div className="receiving-check-lines">
                {checkedLines.map(
                  (line) => (
                    <div
                      key={line.id}
                      className="receiving-check-line"
                    >
                      <div className="receiving-check-product">
                        <strong>
                          {line.sku}
                        </strong>

                        <span>
                          {productName(
                            line.sku,
                          )}
                        </span>

                        <small>
                          Previsto:{' '}
                          {
                            line.expectedQuantity
                          }{' '}
                          un.
                        </small>
                      </div>

                      <div className="receiving-field">
                        <label>
                          Recebido
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            line.receivedQuantity
                          }
                          disabled={
                            message?.type ===
                            'success'
                          }
                          onChange={(
                            event,
                          ) =>
                            updateLine(
                              line.id,
                              'receivedQuantity',
                              event.target
                                .value,
                            )
                          }
                        />
                      </div>

                      <div className="receiving-field">
                        <label>
                          Posição
                        </label>

                        <select
                          value={
                            line.position
                          }
                          disabled={
                            Number(
                              line.receivedQuantity,
                            ) === 0 ||
                            message?.type ===
                              'success'
                          }
                          onChange={(
                            event,
                          ) =>
                            updateLine(
                              line.id,
                              'position',
                              event.target
                                .value,
                            )
                          }
                        >
                          <option value="">
                            Selecione
                          </option>

                          {availablePositions(
                            line.sku,
                          ).map(
                            (code) => {
                              const current =
                                positions.find(
                                  (
                                    position,
                                  ) =>
                                    position.position ===
                                    code,
                                )

                              return (
                                <option
                                  key={
                                    code
                                  }
                                  value={
                                    code
                                  }
                                >
                                  {code}{' '}
                                  {current
                                    ? `· ${current.quantity}/${current.capacity} un.`
                                    : '· Livre'}
                                </option>
                              )
                            },
                          )}
                        </select>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="receiving-conference-footer-grid">
                <div className="receiving-field">
                  <label>
                    Responsável
                  </label>

                  <input
                    value={responsible}
                    disabled={
                      message?.type ===
                      'success'
                    }
                    onChange={(
                      event,
                    ) =>
                      setResponsible(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="receiving-field">
                  <label>
                    Observação
                  </label>

                  <input
                    value={notes}
                    disabled={
                      message?.type ===
                      'success'
                    }
                    onChange={(
                      event,
                    ) =>
                      setNotes(
                        event.target.value,
                      )
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`receiving-message ${message.type}`}
                >
                  {message.text}
                </div>
              )}

              <div className="receiving-modal-actions">
                {message?.type ===
                'success' ? (
                  <button
                    type="button"
                    className="receiving-primary-button"
                    onClick={() =>
                      setSelectedRecord(
                        null,
                      )
                    }
                  >
                    Concluir
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="receiving-secondary-button"
                      onClick={() =>
                        setSelectedRecord(
                          null,
                        )
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="receiving-primary-button"
                    >
                      Finalizar recebimento
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
