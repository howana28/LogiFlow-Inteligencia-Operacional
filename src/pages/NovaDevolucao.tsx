import {
  ClipboardPlus,
  PackageSearch,
} from 'lucide-react'
import {
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import { useReturns } from '../context/ReturnsContext'
import './Devolucoes.css'

export function NovaDevolucao() {
  const navigate = useNavigate()
  const { products } = useInventory()
  const { createReturn } = useReturns()

  const [orderNumber, setOrderNumber] =
    useState('')

  const [sku, setSku] =
    useState('')

  const [quantity, setQuantity] =
    useState('1')

  const [reason, setReason] =
    useState('')

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const selectedProduct =
    products.find(
      (product) =>
        product.sku === sku,
    )

  function clearForm() {
    setOrderNumber('')
    setSku('')
    setQuantity('1')
    setReason('')
    setMessage(null)
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    try {
      const record = createReturn({
        orderNumber,
        sku,
        quantity: Number(quantity),
        reason,
      })

      setMessage({
        type: 'success',
        text: `${record.orderNumber} foi registrada e enviada para a fila de revisão.`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível registrar a devolução.',
      })
    }
  }

  return (
    <section className="returns-page">
      <div className="returns-heading">
        <div>
          <span className="page-eyebrow">
            LOGÍSTICA REVERSA
          </span>

          <h1>Nova devolução</h1>

          <p className="page-description">
            Registre uma ocorrência e
            encaminhe o item para análise
            e conferência.
          </p>
        </div>
      </div>

      <div className="return-form-card">
        <div className="return-form-header">
          <ClipboardPlus size={17} />

          <div>
            <strong>
              Registrar ocorrência
            </strong>

            <span>
              O lançamento entrará com
              status A revisar.
            </span>
          </div>
        </div>

        <form
          className="return-form"
          onSubmit={handleSubmit}
        >
          <div className="return-form-grid">
            <div className="return-field">
              <label>
                Número do pedido
              </label>

              <input
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(
                    event.target.value,
                  )
                }
                placeholder="Ex.: PED-10921"
              />
            </div>

            <div className="return-field">
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
              />
            </div>

            <div className="return-field full">
              <label>
                Produto
              </label>

              <select
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value,
                  )
                }
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
                <div className="return-product-preview">
                  <PackageSearch
                    size={15}
                  />

                  <div>
                    <strong>
                      {
                        selectedProduct.name
                      }
                    </strong>

                    <span>
                      {
                        selectedProduct.category
                      }{' '}
                      ·{' '}
                      {
                        selectedProduct.brand
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="return-field full">
              <label>
                Motivo da devolução
              </label>

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                placeholder="Descreva o motivo informado para a devolução."
              />
            </div>
          </div>

          {message && (
            <div
              className={`return-message ${message.type}`}
            >
              {message.text}
            </div>
          )}

          <div className="return-form-actions">
            <button
              type="button"
              className="returns-secondary-button"
              onClick={clearForm}
            >
              Limpar
            </button>

            {message?.type ===
            'success' ? (
              <button
                type="button"
                className="returns-primary-button"
                onClick={() =>
                  navigate(
                    '/devolucoes/revisar',
                  )
                }
              >
                Ver fila de revisão
              </button>
            ) : (
              <button
                type="submit"
                className="returns-primary-button"
              >
                Registrar devolução
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
