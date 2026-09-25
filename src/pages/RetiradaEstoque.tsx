import {
  ArrowUpFromLine,
  Boxes,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import './InventoryOperations.css'

export function RetiradaEstoque() {
  const navigate = useNavigate()

  const {
    products,
    positions,
    registerWithdrawal,
  } = useInventory()

  const [sku, setSku] =
    useState('')

  const [position, setPosition] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [reason, setReason] =
    useState('Separação de pedido')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const productsInStock =
    useMemo(
      () =>
        products.filter((product) =>
          positions.some(
            (item) =>
              item.sku ===
                product.sku &&
              item.quantity > 0,
          ),
        ),
      [products, positions],
    )

  const productPositions =
    positions.filter(
      (item) => item.sku === sku,
    )

  const selectedPosition =
    productPositions.find(
      (item) =>
        item.position === position,
    )

  const selectedProduct =
    products.find(
      (item) => item.sku === sku,
    )

  function clearForm() {
    setSku('')
    setPosition('')
    setQuantity('')
    setReason(
      'Separação de pedido',
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

    if (!sku || !position) {
      setMessage({
        type: 'error',
        text: 'Selecione o produto e a posição de origem.',
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
        text: 'Informe o responsável pela retirada.',
      })
      return
    }

    if (!reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o motivo da retirada.',
      })
      return
    }

    try {
      registerWithdrawal({
        sku,
        position,
        quantity: parsedQuantity,
        responsible:
          responsible.trim(),
        reason: reason.trim(),
      })

      setMessage({
        type: 'success',
        text: `${parsedQuantity} unidades de ${sku} foram retiradas de ${position}.`,
      })

      setQuantity('')

      const stillExists =
        positions.find(
          (item) =>
            item.position ===
            position,
        )

      if (
        stillExists &&
        parsedQuantity >=
          stillExists.quantity
      ) {
        setPosition('')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível registrar a retirada.',
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
            Retirada de estoque
          </h1>

          <p className="page-description">
            Registre saídas com controle
            de SKU, endereço, quantidade
            e responsável.
          </p>
        </div>
      </div>

      <div className="operation-form-card">
        <div className="operation-form-header">
          <strong>
            <ArrowUpFromLine
              size={15}
              style={{
                verticalAlign:
                  'middle',
                marginRight: 7,
              }}
            />
            Nova retirada
          </strong>

          <span>
            O saldo será atualizado
            automaticamente em todos os
            módulos de estoque.
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
                  setQuantity('')
                  setMessage(null)
                }}
              >
                <option value="">
                  Selecione o produto
                </option>

                {productsInStock.map(
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
                Posição de origem
              </label>

              <select
                value={position}
                disabled={!sku}
                onChange={(event) => {
                  setPosition(
                    event.target.value,
                  )
                  setQuantity('')
                }}
              >
                <option value="">
                  Selecione a posição
                </option>

                {productPositions.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={
                        item.position
                      }
                    >
                      {item.position} ·{' '}
                      {item.quantity} un.
                      disponíveis
                    </option>
                  ),
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
                max={
                  selectedPosition
                    ?.quantity
                }
                disabled={
                  !selectedPosition
                }
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 5"
              />

              {selectedPosition && (
                <small>
                  Máximo disponível:{' '}
                  {
                    selectedPosition.quantity
                  }{' '}
                  unidades.
                </small>
              )}
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
                Motivo da retirada
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

          {selectedPosition && (
            <div className="operation-position-info">
              <strong>
                <Boxes
                  size={14}
                  style={{
                    verticalAlign:
                      'middle',
                    marginRight: 6,
                  }}
                />
                {
                  selectedPosition.position
                }
              </strong>

              <span>
                {
                  selectedPosition.quantity
                }{' '}
                de{' '}
                {
                  selectedPosition.capacity
                }{' '}
                unidades ocupadas.
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
              <ArrowUpFromLine
                size={14}
                style={{
                  verticalAlign:
                    'middle',
                  marginRight: 6,
                }}
              />
              Registrar retirada
            </button>
          </div>

          {message?.type ===
            'success' && (
            <div className="operation-success-card">
              <strong>
                Saldo atualizado
              </strong>

              <span>
                A retirada já está
                refletida no estoque e
                no histórico.
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/estoque/posicoes',
                  )
                }
              >
                Ver posições atuais
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}