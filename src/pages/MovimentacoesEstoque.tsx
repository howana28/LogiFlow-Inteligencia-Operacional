import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  Download,
  Search,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { ProductDetailsDrawer } from '../components/ProductDetailsDrawer'
import { useInventory } from '../context/InventoryContext'
import type {
  InventoryMovement,
  MovementType,
} from '../types/logistics'
import './MovimentacoesEstoque.css'

type MovementFilter =
  | 'TODOS'
  | MovementType

const movementLabels: Record<
  MovementType,
  string
> = {
  ENTRADA: 'Entrada',
  SAÍDA: 'Saída',
  TRANSFERÊNCIA: 'Transferência',
}

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function getMovementIcon(
  type: MovementType,
) {
  if (type === 'ENTRADA') {
    return ArrowDownToLine
  }

  if (type === 'SAÍDA') {
    return ArrowUpFromLine
  }

  return ArrowLeftRight
}

function getMovementLocation(
  movement: InventoryMovement,
) {
  if (
    movement.origin &&
    movement.destination
  ) {
    return `${movement.origin} → ${movement.destination}`
  }

  if (movement.destination) {
    return movement.destination
  }

  if (movement.origin) {
    return movement.origin
  }

  return '—'
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function MovimentacoesEstoque() {
  const {
    products,
    movements,
  } = useInventory()

  const [search, setSearch] =
    useState('')

  const [typeFilter, setTypeFilter] =
    useState<MovementFilter>('TODOS')

  const [
    responsibleFilter,
    setResponsibleFilter,
  ] = useState('TODOS')

  const [selectedSku, setSelectedSku] =
    useState<string | null>(null)

  const sortedMovements = useMemo(
    () =>
      [...movements].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      ),
    [movements],
  )

  const responsibles = useMemo(
    () =>
      Array.from(
        new Set(
          movements.map(
            (movement) =>
              movement.responsible,
          ),
        ),
      ).sort((a, b) =>
        a.localeCompare(b),
      ),
    [movements],
  )

  const filteredMovements =
    useMemo(() => {
      const term = search
        .trim()
        .toLowerCase()

      return sortedMovements.filter(
        (movement) => {
          const product =
            products.find(
              (item) =>
                item.sku ===
                movement.sku,
            )

          const matchesSearch =
            !term ||
            movement.sku
              .toLowerCase()
              .includes(term) ||
            product?.name
              .toLowerCase()
              .includes(term) ||
            movement.responsible
              .toLowerCase()
              .includes(term) ||
            movement.reason
              .toLowerCase()
              .includes(term) ||
            movement.origin
              ?.toLowerCase()
              .includes(term) ||
            movement.destination
              ?.toLowerCase()
              .includes(term)

          const matchesType =
            typeFilter === 'TODOS' ||
            movement.type ===
              typeFilter

          const matchesResponsible =
            responsibleFilter ===
              'TODOS' ||
            movement.responsible ===
              responsibleFilter

          return (
            matchesSearch &&
            matchesType &&
            matchesResponsible
          )
        },
      )
    }, [
      sortedMovements,
      products,
      search,
      typeFilter,
      responsibleFilter,
    ])

  const entryUnits = movements
    .filter(
      (movement) =>
        movement.type === 'ENTRADA',
    )
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0,
    )

  const exitUnits = movements
    .filter(
      (movement) =>
        movement.type === 'SAÍDA',
    )
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0,
    )

  const transferUnits = movements
    .filter(
      (movement) =>
        movement.type ===
        'TRANSFERÊNCIA',
    )
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0,
    )

  function exportCsv() {
    const header = [
      'Data',
      'Tipo',
      'SKU',
      'Produto',
      'Origem',
      'Destino',
      'Quantidade',
      'Responsável',
      'Motivo',
    ]

    const rows =
      filteredMovements.map(
        (movement) => {
          const product =
            products.find(
              (item) =>
                item.sku ===
                movement.sku,
            )

          return [
            dateFormatter.format(
              new Date(
                movement.createdAt,
              ),
            ),
            movementLabels[
              movement.type
            ],
            movement.sku,
            product?.name ?? '',
            movement.origin ?? '',
            movement.destination ?? '',
            movement.quantity,
            movement.responsible,
            movement.reason,
          ]
        },
      )

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCsv)
          .join(';'),
      )
      .join('\n')

    const blob = new Blob(
      [`\uFEFF${csv}`],
      {
        type: 'text/csv;charset=utf-8;',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      'logiflow_movimentacoes.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="movements-page">
      <div className="movements-heading">
        <div>
          <span className="page-eyebrow">
            RASTREABILIDADE
          </span>

          <h1>Movimentações</h1>

          <p className="page-description">
            Acompanhe entradas,
            retiradas e transferências
            registradas no estoque.
          </p>
        </div>

        <button
          type="button"
          className="movements-export"
          onClick={exportCsv}
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      <div className="movements-kpis">
        <div>
          <div className="movement-kpi-icon neutral">
            <Boxes size={18} />
          </div>

          <span>
            Movimentações
          </span>

          <strong>
            {movements.length}
          </strong>

          <small>
            registros totais
          </small>
        </div>

        <div>
          <div className="movement-kpi-icon entry">
            <ArrowDownToLine
              size={18}
            />
          </div>

          <span>
            Entradas
          </span>

          <strong>
            {entryUnits}
          </strong>

          <small>
            unidades recebidas
          </small>
        </div>

        <div>
          <div className="movement-kpi-icon exit">
            <ArrowUpFromLine
              size={18}
            />
          </div>

          <span>
            Saídas
          </span>

          <strong>
            {exitUnits}
          </strong>

          <small>
            unidades retiradas
          </small>
        </div>

        <div>
          <div className="movement-kpi-icon transfer">
            <ArrowLeftRight
              size={18}
            />
          </div>

          <span>
            Transferências
          </span>

          <strong>
            {transferUnits}
          </strong>

          <small>
            unidades realocadas
          </small>
        </div>
      </div>

      <div className="movements-toolbar">
        <div className="movements-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar SKU, produto, responsável ou endereço"
          />
        </div>

        <div className="movements-filters">
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target
                  .value as MovementFilter,
              )
            }
          >
            <option value="TODOS">
              Todos os tipos
            </option>

            <option value="ENTRADA">
              Entradas
            </option>

            <option value="SAÍDA">
              Saídas
            </option>

            <option value="TRANSFERÊNCIA">
              Transferências
            </option>
          </select>

          <select
            value={
              responsibleFilter
            }
            onChange={(event) =>
              setResponsibleFilter(
                event.target.value,
              )
            }
          >
            <option value="TODOS">
              Todos responsáveis
            </option>

            {responsibles.map(
              (responsible) => (
                <option
                  key={responsible}
                  value={
                    responsible
                  }
                >
                  {responsible}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="movements-card">
        <div className="movements-card-header">
          <div>
            <strong>
              Histórico operacional
            </strong>

            <span>
              {
                filteredMovements.length
              }{' '}
              registros encontrados
            </span>
          </div>
        </div>

        {filteredMovements.length >
        0 ? (
          <div className="movements-table-wrapper">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Endereço</th>
                  <th>Quantidade</th>
                  <th>Responsável</th>
                  <th>Motivo</th>
                </tr>
              </thead>

              <tbody>
                {filteredMovements.map(
                  (movement) => {
                    const product =
                      products.find(
                        (item) =>
                          item.sku ===
                          movement.sku,
                      )

                    const Icon =
                      getMovementIcon(
                        movement.type,
                      )

                    return (
                      <tr
                        key={
                          movement.id
                        }
                      >
                        <td>
                          <span className="movement-date">
                            {dateFormatter.format(
                              new Date(
                                movement.createdAt,
                              ),
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`movement-type ${
                              movement.type ===
                              'ENTRADA'
                                ? 'entry'
                                : movement.type ===
                                    'SAÍDA'
                                  ? 'exit'
                                  : 'transfer'
                            }`}
                          >
                            <Icon size={13} />

                            {
                              movementLabels[
                                movement.type
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="movement-product"
                            onClick={() =>
                              setSelectedSku(
                                movement.sku,
                              )
                            }
                          >
                            <strong>
                              {movement.sku}
                            </strong>

                            <span>
                              {product?.name ??
                                'Produto'}
                            </span>
                          </button>
                        </td>

                        <td>
                          <span className="movement-location">
                            {getMovementLocation(
                              movement,
                            )}
                          </span>
                        </td>

                        <td>
                          <strong className="movement-quantity">
                            {movement.quantity}
                          </strong>{' '}
                          un.
                        </td>

                        <td>
                          {
                            movement.responsible
                          }
                        </td>

                        <td>
                          <span className="movement-reason">
                            {movement.reason}
                          </span>
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="movements-empty">
            <ArrowLeftRight size={23} />

            <strong>
              Nenhuma movimentação
              encontrada
            </strong>

            <span>
              Ajuste os filtros ou
              registre uma nova entrada
              ou retirada.
            </span>
          </div>
        )}
      </div>

      <ProductDetailsDrawer
        sku={selectedSku}
        onClose={() =>
          setSelectedSku(null)
        }
      />
    </section>
  )
}
