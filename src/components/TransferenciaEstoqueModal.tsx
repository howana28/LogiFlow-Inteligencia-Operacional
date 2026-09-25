import {
  ArrowLeftRight,
  Boxes,
  MapPin,
  X,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useInventory } from '../context/InventoryContext'
import './TransferenciaEstoqueModal.css'

interface TransferenciaEstoqueModalProps {
  sku: string
  origin: string
  onClose: () => void
  onSuccess: () => void
}

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

export function TransferenciaEstoqueModal({
  sku,
  origin,
  onClose,
  onSuccess,
}: TransferenciaEstoqueModalProps) {
  const {
    products,
    positions,
    registerTransfer,
  } = useInventory()

  const [destination, setDestination] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [reason, setReason] =
    useState('Reorganização de endereço')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const product = products.find(
    (item) => item.sku === sku,
  )

  const originPosition =
    positions.find(
      (position) =>
        position.position === origin &&
        position.sku === sku,
    )

  const destinationPosition =
    positions.find(
      (position) =>
        position.position === destination,
    )

  const availableDestinations =
    useMemo(
      () =>
        positionCodes.filter((code) => {
          if (code === origin) {
            return false
          }

          const current =
            positions.find(
              (position) =>
                position.position === code,
            )

          return (
            !current ||
            current.sku === sku
          )
        }),
      [positions, origin, sku],
    )

  const destinationAvailableCapacity =
    destinationPosition
      ? destinationPosition.capacity -
        destinationPosition.quantity
      : DEFAULT_POSITION_CAPACITY

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()
    setMessage(null)

    const parsedQuantity =
      Number(quantity)

    if (!destination) {
      setMessage({
        type: 'error',
        text: 'Selecione a posição de destino.',
      })
      return
    }

    if (
      !parsedQuantity ||
      parsedQuantity <= 0
    ) {
      setMessage({
        type: 'error',
        text: 'Informe uma quantidade válida.',
      })
      return
    }

    if (!responsible.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o responsável pela transferência.',
      })
      return
    }

    if (!reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o motivo da transferência.',
      })
      return
    }

    try {
      registerTransfer({
        sku,
        origin,
        destination,
        quantity: parsedQuantity,
        responsible:
          responsible.trim(),
        reason: reason.trim(),
      })

      setMessage({
        type: 'success',
        text: `${parsedQuantity} unidades de ${sku} foram transferidas de ${origin} para ${destination}.`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível concluir a transferência.',
      })
    }
  }

  return (
    <div
      className="transfer-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="transfer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="transfer-modal-close"
          onClick={onClose}
          aria-label="Fechar transferência"
        >
          <X size={19} />
        </button>

        <header className="transfer-modal-header">
          <div className="transfer-modal-icon">
            <ArrowLeftRight size={20} />
          </div>

          <span>
            MOVIMENTAÇÃO INTERNA
          </span>

          <h2>
            Transferir produto
          </h2>

          <p>
            Realoque unidades entre
            endereços mantendo a
            rastreabilidade da operação.
          </p>
        </header>

        <div className="transfer-product-card">
          <div className="transfer-product-icon">
            <Boxes size={18} />
          </div>

          <div>
            <strong>
              {product?.name ?? sku}
            </strong>

            <span>
              {sku} · Origem {origin}
            </span>
          </div>

          <div className="transfer-origin-stock">
            <strong>
              {originPosition?.quantity ??
                0}
            </strong>

            <span>
              un. disponíveis
            </span>
          </div>
        </div>

        <form
          className="transfer-form"
          onSubmit={handleSubmit}
        >
          <div className="transfer-field">
            <label>
              Posição de destino
            </label>

            <select
              value={destination}
              disabled={
                message?.type ===
                'success'
              }
              onChange={(event) => {
                setDestination(
                  event.target.value,
                )
                setMessage(null)
              }}
            >
              <option value="">
                Selecione o destino
              </option>

              {availableDestinations.map(
                (code) => {
                  const current =
                    positions.find(
                      (position) =>
                        position.position ===
                        code,
                    )

                  return (
                    <option
                      key={code}
                      value={code}
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

            {destination && (
              <div className="transfer-destination-info">
                <MapPin size={14} />

                <div>
                  <strong>
                    {destination}
                  </strong>

                  <span>
                    {destinationPosition
                      ? `${destinationPosition.quantity}/${destinationPosition.capacity} un. ocupadas · ${destinationAvailableCapacity} livres`
                      : `Posição livre · capacidade padrão ${DEFAULT_POSITION_CAPACITY} un.`}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="transfer-two-columns">
            <div className="transfer-field">
              <label>
                Quantidade
              </label>

              <input
                type="number"
                min="1"
                max={Math.min(
                  originPosition?.quantity ??
                    0,
                  destinationAvailableCapacity,
                )}
                disabled={
                  !destination ||
                  message?.type ===
                    'success'
                }
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 10"
              />

              <small>
                Máximo nesta transferência:{' '}
                {destination
                  ? Math.min(
                      originPosition?.quantity ??
                        0,
                      destinationAvailableCapacity,
                    )
                  : '—'}{' '}
                un.
              </small>
            </div>

            <div className="transfer-field">
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
          </div>

          <div className="transfer-field">
            <label>
              Motivo
            </label>

            <textarea
              value={reason}
              disabled={
                message?.type ===
                  'success'
              }
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
            />
          </div>

          {message && (
            <div
              className={`transfer-message ${message.type}`}
            >
              {message.text}
            </div>
          )}

          <div className="transfer-actions">
            {message?.type ===
            'success' ? (
              <button
                type="button"
                className="transfer-primary"
                onClick={onSuccess}
              >
                Concluir
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="transfer-secondary"
                  onClick={onClose}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="transfer-primary"
                >
                  <ArrowLeftRight
                    size={14}
                  />
                  Confirmar transferência
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
