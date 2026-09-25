import {
  ArrowRight,
  Search,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { useInventory } from '../context/InventoryContext'
import { useReturns } from '../context/ReturnsContext'
import type { ReturnRecord } from '../types/logistics'
import './Devolucoes.css'

type ListMode =
  | 'review'
  | 'conference'
  | 'recent'
  | 'all'

interface DevolucoesListaProps {
  mode: ListMode
}

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const modeCopy: Record<
  ListMode,
  {
    eyebrow: string
    title: string
    description: string
  }
> = {
  review: {
    eyebrow: 'ANÁLISE',
    title: 'Devoluções a revisar',
    description:
      'Analise ocorrências pendentes antes de encaminhá-las para conferência.',
  },
  conference: {
    eyebrow: 'CONFERÊNCIA',
    title: 'Conferência de estoque',
    description:
      'Acompanhe os itens encaminhados para validação física.',
  },
  recent: {
    eyebrow: 'HISTÓRICO',
    title: 'Últimos lançamentos',
    description:
      'Consulte as devoluções registradas mais recentemente.',
  },
  all: {
    eyebrow: 'REGISTROS',
    title: 'Todas devoluções',
    description:
      'Pesquise e filtre o histórico completo de devoluções.',
  },
}

export function DevolucoesLista({
  mode,
}: DevolucoesListaProps) {
  const {
    returns,
    updateReturnStatus,
  } = useReturns()

  const { products } = useInventory()

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<'TODOS' | ReturnRecord['status']>(
      'TODOS',
    )

  const [feedback, setFeedback] =
    useState<string | null>(null)

  const copy = modeCopy[mode]

  const rows = useMemo(() => {
    let result = [...returns].sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    )

    if (mode === 'review') {
      result = result.filter(
        (record) =>
          record.status ===
          'A revisar',
      )
    }

    if (mode === 'conference') {
      result = result.filter(
        (record) =>
          record.status ===
          'Em conferência',
      )
    }

    if (mode === 'recent') {
      result = result.slice(0, 10)
    }

    if (
      mode === 'all' &&
      statusFilter !== 'TODOS'
    ) {
      result = result.filter(
        (record) =>
          record.status ===
          statusFilter,
      )
    }

    const term = search
      .trim()
      .toLowerCase()

    if (term) {
      result = result.filter(
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
    }

    return result
  }, [
    returns,
    mode,
    statusFilter,
    search,
    products,
  ])

  function getProductName(
    sku: string,
  ) {
    return (
      products.find(
        (product) =>
          product.sku === sku,
      )?.name ?? sku
    )
  }

  function sendToConference(
    record: ReturnRecord,
  ) {
    updateReturnStatus(
      record.id,
      'Em conferência',
    )

    setFeedback(
      `${record.orderNumber} foi encaminhada para conferência de estoque.`,
    )
  }

  return (
    <section className="returns-page">
      <div className="returns-heading">
        <div>
          <span className="page-eyebrow">
            {copy.eyebrow}
          </span>

          <h1>{copy.title}</h1>

          <p className="page-description">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="returns-toolbar">
        <div className="returns-search">
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

        {mode === 'all' && (
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'TODOS'
                  | ReturnRecord['status'],
              )
            }
          >
            <option value="TODOS">
              Todos os status
            </option>

            <option value="A revisar">
              A revisar
            </option>

            <option value="Em conferência">
              Em conferência
            </option>

            <option value="Finalizada">
              Finalizadas
            </option>
          </select>
        )}
      </div>

      {feedback && (
        <div className="returns-feedback">
          {feedback}
        </div>
      )}

      <div className="returns-table-card">
        <div className="returns-table-header">
          <div>
            <strong>
              {copy.title}
            </strong>

            <span>
              {rows.length}{' '}
              registros encontrados
            </span>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="returns-table-wrapper">
            <table className="returns-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pedido</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Motivo</th>
                  <th>Status</th>

                  {mode ===
                    'review' && (
                    <th>Ação</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {rows.map(
                  (record) => (
                    <tr
                      key={record.id}
                    >
                      <td>
                        {dateFormatter.format(
                          new Date(
                            record.createdAt,
                          ),
                        )}
                      </td>

                      <td>
                        <strong className="return-order">
                          {
                            record.orderNumber
                          }
                        </strong>
                      </td>

                      <td>
                        <strong className="return-product-name">
                          {record.sku}
                        </strong>

                        <span className="return-product-subtitle">
                          {getProductName(
                            record.sku,
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {
                            record.quantity
                          }
                        </strong>{' '}
                        un.
                      </td>

                      <td>
                        <span className="return-reason">
                          {record.reason}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`return-status ${
                            record.status ===
                            'A revisar'
                              ? 'review'
                              : record.status ===
                                  'Em conferência'
                                ? 'conference'
                                : 'finished'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {mode ===
                        'review' && (
                        <td>
                          <button
                            type="button"
                            className="return-row-action"
                            onClick={() =>
                              sendToConference(
                                record,
                              )
                            }
                          >
                            Conferir
                            <ArrowRight
                              size={13}
                            />
                          </button>
                        </td>
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="returns-empty returns-empty-large">
            Nenhum registro encontrado
            nesta etapa.
          </div>
        )}
      </div>

      {mode === 'conference' && (
        <div className="returns-stage-note">
          A validação física e a decisão
          de reintegrar ou não o item ao
          estoque serão implementadas na
          próxima evolução do fluxo.
        </div>
      )}
    </section>
  )
}
