import {
  CheckCircle2,
  PackageCheck,
  PackageX,
  Search,
  X,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useInventory } from '../context/InventoryContext'
import { useReturns } from '../context/ReturnsContext'
import type {
  ReturnRecord,
} from '../types/logistics'
import './ConferenciaDevolucoes.css'

type ConferenceDecision =
  | 'REINTEGRADO'
  | 'NAO_REINTEGRADO'

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

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function ConferenciaDevolucoes() {
  const {
    products,
    positions,
    registerEntry,
  } = useInventory()

  const {
    returns,
    finalizeReturn,
  } = useReturns()

  const [search, setSearch] =
    useState('')

  const [
    selectedReturn,
    setSelectedReturn,
  ] = useState<ReturnRecord | null>(
    null,
  )

  const [decision, setDecision] =
    useState<ConferenceDecision>(
      'REINTEGRADO',
    )

  const [destination, setDestination] =
    useState('')

  const [quantity, setQuantity] =
    useState('1')

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [note, setNote] =
    useState('')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const conferenceReturns = useMemo(
    () =>
      returns
        .filter(
          (record) =>
            record.status ===
            'Em conferência',
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        ),
    [returns],
  )

  const filteredReturns = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    if (!term) {
      return conferenceReturns
    }

    return conferenceReturns.filter(
      (record) => {
        const product =
          products.find(
            (item) =>
              item.sku ===
              record.sku,
          )

        return (
          record.orderNumber
            .toLowerCase()
            .includes(term) ||
          record.sku
            .toLowerCase()
            .includes(term) ||
          record.reason
            .toLowerCase()
            .includes(term) ||
          product?.name
            .toLowerCase()
            .includes(term)
        )
      },
    )
  }, [
    conferenceReturns,
    products,
    search,
  ])

  const selectedProduct =
    selectedReturn
      ? products.find(
          (product) =>
            product.sku ===
            selectedReturn.sku,
        )
      : undefined

  const destinationPosition =
    positions.find(
      (position) =>
        position.position ===
        destination,
    )

  const availablePositions = useMemo(
    () => {
      if (!selectedReturn) {
        return []
      }

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
            current.sku ===
              selectedReturn.sku
          )
        },
      )
    },
    [positions, selectedReturn],
  )

  function openConference(
    record: ReturnRecord,
  ) {
    setSelectedReturn(record)
    setDecision('REINTEGRADO')
    setDestination('')
    setQuantity(
      String(record.quantity),
    )
    setResponsible('Ana Mendes')
    setNote('')
    setMessage(null)
  }

  function closeConference() {
    setSelectedReturn(null)
    setMessage(null)
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (!selectedReturn) {
      return
    }

    setMessage(null)

    const parsedQuantity =
      Number(quantity)

    if (
      decision === 'REINTEGRADO' &&
      !destination
    ) {
      setMessage({
        type: 'error',
        text: 'Selecione a posição de reintegração.',
      })
      return
    }

    if (
      decision === 'REINTEGRADO' &&
      (!parsedQuantity ||
        parsedQuantity <= 0 ||
        parsedQuantity >
          selectedReturn.quantity)
    ) {
      setMessage({
        type: 'error',
        text: `A quantidade reintegrada deve estar entre 1 e ${selectedReturn.quantity}.`,
      })
      return
    }

    if (!responsible.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o responsável pela conferência.',
      })
      return
    }

    try {
      if (
        decision ===
        'REINTEGRADO'
      ) {
        registerEntry({
          sku: selectedReturn.sku,
          position: destination,
          quantity: parsedQuantity,
          capacity:
            destinationPosition
              ?.capacity ??
            DEFAULT_POSITION_CAPACITY,
          responsible:
            responsible.trim(),
          reason: `Reintegração de devolução ${selectedReturn.orderNumber}${
            note.trim()
              ? ` — ${note.trim()}`
              : ''
          }`,
        })
      }

      finalizeReturn(
        selectedReturn.id,
        {
          outcome: decision,
          position:
            decision ===
            'REINTEGRADO'
              ? destination
              : undefined,
          quantity:
            decision ===
            'REINTEGRADO'
              ? parsedQuantity
              : 0,
          responsible:
            responsible.trim(),
          note,
        },
      )

      setMessage({
        type: 'success',
        text:
          decision ===
          'REINTEGRADO'
            ? `${parsedQuantity} unidade(s) foram reintegradas ao estoque e a devolução foi finalizada.`
            : 'A devolução foi finalizada sem reintegração ao estoque.',
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
    <section className="return-conference-page">
      <div className="return-conference-heading">
        <div>
          <span className="page-eyebrow">
            CONFERÊNCIA
          </span>

          <h1>
            Conferência de estoque
          </h1>

          <p className="page-description">
            Valide os itens devolvidos e
            defina se eles retornam ao
            estoque.
          </p>
        </div>

        <div className="conference-summary">
          <span>
            Aguardando conferência
          </span>

          <strong>
            {
              conferenceReturns.length
            }
          </strong>
        </div>
      </div>

      <div className="conference-search">
        <Search size={16} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Buscar pedido, SKU, produto ou motivo"
        />
      </div>

      <div className="conference-card">
        <div className="conference-card-header">
          <div>
            <strong>
              Fila de conferência
            </strong>

            <span>
              {filteredReturns.length}{' '}
              registros encontrados
            </span>
          </div>
        </div>

        {filteredReturns.length > 0 ? (
          <div className="conference-list">
            {filteredReturns.map(
              (record) => {
                const product =
                  products.find(
                    (item) =>
                      item.sku ===
                      record.sku,
                  )

                return (
                  <button
                    key={record.id}
                    type="button"
                    className="conference-item"
                    onClick={() =>
                      openConference(
                        record,
                      )
                    }
                  >
                    <div className="conference-item-icon">
                      <PackageCheck
                        size={17}
                      />
                    </div>

                    <div className="conference-item-main">
                      <strong>
                        {
                          record.orderNumber
                        }
                      </strong>

                      <span>
                        {record.sku} ·{' '}
                        {product?.name ??
                          'Produto'}
                      </span>

                      <small>
                        {
                          record.reason
                        }
                      </small>
                    </div>

                    <div className="conference-item-meta">
                      <strong>
                        {
                          record.quantity
                        }{' '}
                        un.
                      </strong>

                      <span>
                        {dateFormatter.format(
                          new Date(
                            record.createdAt,
                          ),
                        )}
                      </span>
                    </div>
                  </button>
                )
              },
            )}
          </div>
        ) : (
          <div className="conference-empty">
            <CheckCircle2
              size={24}
            />

            <strong>
              Fila concluída
            </strong>

            <span>
              Nenhuma devolução está
              aguardando conferência.
            </span>
          </div>
        )}
      </div>

      {selectedReturn && (
        <div
          className="conference-modal-backdrop"
          onMouseDown={
            closeConference
          }
        >
          <div
            className="conference-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="conference-modal-close"
              onClick={
                closeConference
              }
              aria-label="Fechar conferência"
            >
              <X size={19} />
            </button>

            <header className="conference-modal-header">
              <div className="conference-modal-icon">
                <PackageCheck
                  size={20}
                />
              </div>

              <span>
                {selectedReturn.orderNumber}
              </span>

              <h2>
                Conferir devolução
              </h2>

              <p>
                {selectedReturn.sku} ·{' '}
                {selectedProduct?.name ??
                  'Produto'}
              </p>
            </header>

            <div className="conference-return-summary">
              <div>
                <span>
                  Quantidade devolvida
                </span>

                <strong>
                  {
                    selectedReturn.quantity
                  }{' '}
                  un.
                </strong>
              </div>

              <div>
                <span>
                  Motivo informado
                </span>

                <strong>
                  {
                    selectedReturn.reason
                  }
                </strong>
              </div>
            </div>

            <form
              className="conference-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="conference-decision-grid">
                <button
                  type="button"
                  disabled={
                    message?.type ===
                    'success'
                  }
                  className={`conference-decision ${
                    decision ===
                    'REINTEGRADO'
                      ? 'active reintegrate'
                      : ''
                  }`}
                  onClick={() => {
                    setDecision(
                      'REINTEGRADO',
                    )
                    setMessage(null)
                  }}
                >
                  <PackageCheck
                    size={19}
                  />

                  <strong>
                    Reintegrar ao estoque
                  </strong>

                  <span>
                    O item volta para uma
                    posição de armazenagem.
                  </span>
                </button>

                <button
                  type="button"
                  disabled={
                    message?.type ===
                    'success'
                  }
                  className={`conference-decision ${
                    decision ===
                    'NAO_REINTEGRADO'
                      ? 'active reject'
                      : ''
                  }`}
                  onClick={() => {
                    setDecision(
                      'NAO_REINTEGRADO',
                    )
                    setMessage(null)
                  }}
                >
                  <PackageX
                    size={19}
                  />

                  <strong>
                    Não reintegrar
                  </strong>

                  <span>
                    Finaliza sem alterar o
                    saldo disponível.
                  </span>
                </button>
              </div>

              {decision ===
                'REINTEGRADO' && (
                <div className="conference-two-columns">
                  <div className="conference-field">
                    <label>
                      Posição de destino
                    </label>

                    <select
                      value={
                        destination
                      }
                      disabled={
                        message?.type ===
                        'success'
                      }
                      onChange={(
                        event,
                      ) => {
                        setDestination(
                          event.target
                            .value,
                        )
                        setMessage(null)
                      }}
                    >
                      <option value="">
                        Selecione a posição
                      </option>

                      {availablePositions.map(
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
                                ? `· ${current.quantity}/${current.capacity} un. · mesmo SKU`
                                : `· Livre · capacidade ${DEFAULT_POSITION_CAPACITY}`}
                            </option>
                          )
                        },
                      )}
                    </select>
                  </div>

                  <div className="conference-field">
                    <label>
                      Quantidade conferida
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={
                        selectedReturn.quantity
                      }
                      disabled={
                        message?.type ===
                        'success'
                      }
                      value={quantity}
                      onChange={(
                        event,
                      ) =>
                        setQuantity(
                          event.target
                            .value,
                        )
                      }
                    />

                    <small>
                      Máximo:{' '}
                      {
                        selectedReturn.quantity
                      }{' '}
                      un.
                    </small>
                  </div>
                </div>
              )}

              <div className="conference-field">
                <label>
                  Responsável
                </label>

                <input
                  value={responsible}
                  disabled={
                    message?.type ===
                    'success'
                  }
                  onChange={(event) =>
                    setResponsible(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="conference-field">
                <label>
                  Observação
                </label>

                <textarea
                  value={note}
                  disabled={
                    message?.type ===
                    'success'
                  }
                  onChange={(event) =>
                    setNote(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: embalagem íntegra, item sem sinais de uso..."
                />
              </div>

              {message && (
                <div
                  className={`conference-message ${message.type}`}
                >
                  {message.text}
                </div>
              )}

              <div className="conference-actions">
                {message?.type ===
                'success' ? (
                  <button
                    type="button"
                    className="conference-primary"
                    onClick={
                      closeConference
                    }
                  >
                    Concluir
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="conference-secondary"
                      onClick={
                        closeConference
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="conference-primary"
                    >
                      Finalizar conferência
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
