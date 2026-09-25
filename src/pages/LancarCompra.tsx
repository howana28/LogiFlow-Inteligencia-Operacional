import {
  PackagePlus,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import { useReceiving } from '../context/ReceivingContext'
import './Recebimento.css'

interface DraftLine {
  id: string
  sku: string
  quantity: string
}

function createDraftLine(): DraftLine {
  return {
    id: `${Date.now()}-${Math.random()}`,
    sku: '',
    quantity: '1',
  }
}

export function LancarCompra() {
  const navigate = useNavigate()
  const { products } = useInventory()
  const { createReceiving } =
    useReceiving()

  const [supplier, setSupplier] =
    useState('')

  const [
    purchaseNumber,
    setPurchaseNumber,
  ] = useState('')

  const [expectedDate, setExpectedDate] =
    useState('')

  const [responsible, setResponsible] =
    useState('Ana Mendes')

  const [lines, setLines] = useState<
    DraftLine[]
  >([createDraftLine()])

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  function updateLine(
    id: string,
    field: 'sku' | 'quantity',
    value: string,
  ) {
    setLines((current) =>
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

  function addLine() {
    setLines((current) => [
      ...current,
      createDraftLine(),
    ])
  }

  function removeLine(id: string) {
    setLines((current) =>
      current.length === 1
        ? current
        : current.filter(
            (line) =>
              line.id !== id,
          ),
    )
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    try {
      const record = createReceiving({
        supplier,
        purchaseNumber,
        expectedDate,
        responsible,
        lines: lines.map((line) => ({
          sku: line.sku,
          expectedQuantity: Number(
            line.quantity,
          ),
        })),
      })

      setMessage({
        type: 'success',
        text: `${record.purchaseNumber} foi lançada e adicionada às cargas a caminho.`,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível lançar a compra.',
      })
    }
  }

  return (
    <section className="receiving-page">
      <div className="receiving-heading">
        <div>
          <span className="page-eyebrow">
            PLANEJAMENTO DE ENTRADA
          </span>

          <h1>Lançar compra</h1>

          <p className="page-description">
            Registre uma ordem prevista e
            os itens que deverão ser
            conferidos na chegada.
          </p>
        </div>
      </div>

      <div className="receiving-form-card">
        <div className="receiving-form-header">
          <PackagePlus size={17} />

          <div>
            <strong>
              Nova ordem de recebimento
            </strong>

            <span>
              A carga será criada com
              status A caminho.
            </span>
          </div>
        </div>

        <form
          className="receiving-form"
          onSubmit={handleSubmit}
        >
          <div className="receiving-form-grid">
            <div className="receiving-field">
              <label>
                Fornecedor
              </label>

              <input
                value={supplier}
                onChange={(event) =>
                  setSupplier(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Prime Supply"
              />
            </div>

            <div className="receiving-field">
              <label>
                Ordem de compra
              </label>

              <input
                value={purchaseNumber}
                onChange={(event) =>
                  setPurchaseNumber(
                    event.target.value,
                  )
                }
                placeholder="Ex.: OC-2048"
              />
            </div>

            <div className="receiving-field">
              <label>
                Data prevista
              </label>

              <input
                type="date"
                value={expectedDate}
                onChange={(event) =>
                  setExpectedDate(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="receiving-field">
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
          </div>

          <div className="receiving-lines-section">
            <div className="receiving-lines-heading">
              <div>
                <strong>
                  Itens esperados
                </strong>

                <span>
                  Informe os SKUs e
                  quantidades da ordem.
                </span>
              </div>

              <button
                type="button"
                onClick={addLine}
              >
                <Plus size={13} />
                Adicionar item
              </button>
            </div>

            <div className="receiving-lines">
              {lines.map(
                (line, index) => (
                  <div
                    key={line.id}
                    className="receiving-line"
                  >
                    <span className="receiving-line-index">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <div className="receiving-field">
                      <label>
                        Produto
                      </label>

                      <select
                        value={line.sku}
                        onChange={(
                          event,
                        ) =>
                          updateLine(
                            line.id,
                            'sku',
                            event.target
                              .value,
                          )
                        }
                      >
                        <option value="">
                          Selecione
                        </option>

                        {products.map(
                          (
                            product,
                          ) => (
                            <option
                              key={
                                product.sku
                              }
                              value={
                                product.sku
                              }
                            >
                              {
                                product.sku
                              }{' '}
                              —{' '}
                              {
                                product.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="receiving-field qty">
                      <label>
                        Quantidade
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          line.quantity
                        }
                        onChange={(
                          event,
                        ) =>
                          updateLine(
                            line.id,
                            'quantity',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="receiving-line-remove"
                      disabled={
                        lines.length === 1
                      }
                      onClick={() =>
                        removeLine(
                          line.id,
                        )
                      }
                      aria-label="Remover item"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>

          {message && (
            <div
              className={`receiving-message ${message.type}`}
            >
              {message.text}
            </div>
          )}

          <div className="receiving-form-actions">
            {message?.type ===
            'success' ? (
              <button
                type="button"
                className="receiving-primary-button"
                onClick={() =>
                  navigate(
                    '/recebimento/caminho',
                  )
                }
              >
                Ver cargas a caminho
              </button>
            ) : (
              <button
                type="submit"
                className="receiving-primary-button"
              >
                Lançar compra
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
