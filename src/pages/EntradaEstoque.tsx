import {
  ArrowDownToLine,
  MapPinned,
  PackagePlus,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import './InventoryOperations.css'

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

export function EntradaEstoque() {
  const navigate = useNavigate()

  const {
    products,
    positions,
    registerEntry,
  } = useInventory()

  const [sku, setSku] =
    useState('')

  const [position, setPosition] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [capacity, setCapacity] =
    useState('60')

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [reason, setReason] =
    useState('Recebimento de fornecedor')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const selectedProduct =
    products.find(
      (product) => product.sku === sku,
    )

  const selectedPosition =
    positions.find(
      (item) =>
        item.position === position,
    )

  const availablePositions =
    useMemo(() => {
      if (!sku) {
        return positionCodes
      }

      return positionCodes.filter(
        (code) => {
          const current =
            positions.find(
              (item) =>
                item.position === code,
            )

          return (
            !current ||
            current.sku === sku
          )
        },
      )
    }, [positions, sku])

  function clearForm() {
    setSku('')
    setPosition('')
    setQuantity('')
    setCapacity('60')
    setReason(
      'Recebimento de fornecedor',
    )
    setMessage(null)
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()
    setMessage(null)

    const parsedQuantity =
      Number(quantity)

    const parsedCapacity =
      Number(capacity)

    if (!sku) {
      setMessage({
        type: 'error',
        text: 'Selecione o produto que será armazenado.',
      })
      return
    }

    if (!position) {
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

    if (
      !selectedPosition &&
      (!parsedCapacity ||
        parsedCapacity <= 0)
    ) {
      setMessage({
        type: 'error',
        text: 'Informe a capacidade da nova posição.',
      })
      return
    }

    if (!responsible.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o responsável pelo lançamento.',
      })
      return
    }

    if (!reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o motivo da entrada.',
      })
      return
    }

    try {
      registerEntry({
        sku,
        position,
        quantity: parsedQuantity,
        capacity:
          selectedPosition?.capacity ??
          parsedCapacity,
        responsible:
          responsible.trim(),
        reason: reason.trim(),
      })

      setMessage({
        type: 'success',
        text: `${parsedQuantity} unidades de ${sku} foram adicionadas em ${position}.`,
      })

      setQuantity('')
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível registrar a entrada.',
      })
    }
  }

  return (
    <section className="inventory-operation-page">
      <div className="operation-header">
        <div>
          <span className="page-eyebrow">
            ESTOQUE
          </span>

          <h1>
            Entrada de estoque
          </h1>

          <p className="page-description">
            Registre o recebimento e
            direcione os produtos para
            posições disponíveis.
          </p>
        </div>
      </div>

      <div className="operation-form-card">
        <div className="operation-form-header">
          <strong>
            <PackagePlus
              size={15}
              style={{
                verticalAlign:
                  'middle',
                marginRight: 7,
              }}
            />
            Nova entrada
          </strong>

          <span>
            O lançamento atualizará
            automaticamente o mapa,
            posições e histórico de
            movimentações.
          </span>
        </div>

        <form
          className="operation-form"
          onSubmit={handleSubmit}
        >
          <div className="operation-grid">
            <div className="operation-field full">
              <label>
                Produto
              </label>

              <select
                value={sku}
                onChange={(event) => {
                  setSku(
                    event.target.value,
                  )
                  setPosition('')
                  setMessage(null)
                }}
              >
                <option value="">
                  Selecione o produto
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.sku}
                      value={product.sku}
                    >
                      {product.sku} —{' '}
                      {product.name}
                    </option>
                  ),
                )}
              </select>

              {selectedProduct && (
                <small>
                  {
                    selectedProduct.category
                  }{' '}
                  ·{' '}
                  {
                    selectedProduct.brand
                  }
                </small>
              )}
            </div>

            <div className="operation-field">
              <label>
                Posição de destino
              </label>

              <select
                value={position}
                disabled={!sku}
                onChange={(event) => {
                  const nextPosition =
                    event.target.value

                  setPosition(
                    nextPosition,
                  )

                  const current =
                    positions.find(
                      (item) =>
                        item.position ===
                        nextPosition,
                    )

                  if (current) {
                    setCapacity(
                      String(
                        current.capacity,
                      ),
                    )
                  } else {
                    setCapacity('60')
                  }
                }}
              >
                <option value="">
                  Selecione a posição
                </option>

                {availablePositions.map(
                  (code) => {
                    const current =
                      positions.find(
                        (item) =>
                          item.position ===
                          code,
                      )

                    return (
                      <option
                        key={code}
                        value={code}
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

            <div className="operation-field">
              <label>
                Quantidade
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 20"
              />
            </div>

            <div className="operation-field">
              <label>
                Capacidade da posição
              </label>

              <input
                type="number"
                min="1"
                disabled={
                  Boolean(
                    selectedPosition,
                  )
                }
                value={capacity}
                onChange={(event) =>
                  setCapacity(
                    event.target.value,
                  )
                }
              />

              <small>
                {selectedPosition
                  ? 'A capacidade já está definida para esta posição.'
                  : 'Defina a capacidade máxima para uma posição ainda livre.'}
              </small>
            </div>

            <div className="operation-field">
              <label>
                Responsável
              </label>

              <input
                value={responsible}
                onChange={(event) =>
                  setResponsible(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="operation-field full">
              <label>
                Motivo da entrada
              </label>

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          {position && (
            <div className="operation-position-info">
              <strong>
                <MapPinned
                  size={14}
                  style={{
                    verticalAlign:
                      'middle',
                    marginRight: 6,
                  }}
                />
                {position}
              </strong>

              <span>
                {selectedPosition
                  ? `${selectedPosition.quantity} de ${selectedPosition.capacity} unidades ocupadas atualmente.`
                  : 'Posição disponível para nova alocação.'}
              </span>
            </div>
          )}

          {message && (
            <div
              className={`operation-message ${message.type}`}
            >
              {message.text}
            </div>
          )}

          <div className="operation-form-actions">
            <button
              type="button"
              className="operation-secondary-button"
              onClick={clearForm}
            >
              Limpar
            </button>

            <button
              type="submit"
              className="operation-primary-button"
            >
              <ArrowDownToLine
                size={14}
                style={{
                  verticalAlign:
                    'middle',
                  marginRight: 6,
                }}
              />
              Registrar entrada
            </button>
          </div>

          {message?.type ===
            'success' && (
            <div className="operation-success-card">
              <strong>
                Estoque atualizado
              </strong>

              <span>
                A alteração já está
                disponível no mapa e em
                posições atuais.
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/estoque/mapa',
                  )
                }
              >
                Ver no mapa
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}