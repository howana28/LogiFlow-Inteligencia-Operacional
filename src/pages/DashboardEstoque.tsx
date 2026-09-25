import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  MapPin,
  PackageSearch,
  TrendingUp,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import './DashboardEstoque.css'

const currencyFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const streetCapacity = 6

export function DashboardEstoque() {
  const navigate = useNavigate()

  const {
    products,
    positions,
    movements,
  } = useInventory()

  const dashboardData = useMemo(() => {
    const totalUnits = positions.reduce(
      (total, position) =>
        total + position.quantity,
      0,
    )

    const stockValue = products.reduce(
      (total, product) => {
        const productUnits =
          positions
            .filter(
              (position) =>
                position.sku ===
                product.sku,
            )
            .reduce(
              (sum, position) =>
                sum + position.quantity,
              0,
            )

        return (
          total +
          productUnits *
            product.unitCost
        )
      },
      0,
    )

    const inventoryRows =
      products.map((product) => {
        const quantity =
          positions
            .filter(
              (position) =>
                position.sku ===
                product.sku,
            )
            .reduce(
              (sum, position) =>
                sum + position.quantity,
              0,
            )

        return {
          ...product,
          quantity,
        }
      })

    const lowStock =
      inventoryRows.filter(
        (product) =>
          product.quantity <=
          product.minimumStock,
      )

    const categories = Array.from(
      new Set(
        products.map(
          (product) =>
            product.category,
        ),
      ),
    ).map((category) => {
      const categoryProducts =
        products.filter(
          (product) =>
            product.category ===
            category,
        )

      const units =
        categoryProducts.reduce(
          (sum, product) =>
            sum +
            inventoryRows.find(
              (item) =>
                item.sku ===
                product.sku,
            )!.quantity,
          0,
        )

      return {
        category,
        units,
      }
    })

    const streets = [
      'Rua A',
      'Rua B',
      'Rua C',
      'Rua D',
    ].map((street) => {
      const occupied =
        positions.filter(
          (position) =>
            position.street ===
            street,
        ).length

      return {
        street,
        occupied,
        occupancy: Math.round(
          (occupied /
            streetCapacity) *
            100,
        ),
      }
    })

    const sortedMovements =
      [...movements]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        )
        .slice(0, 6)

    const movementSummary =
      movements.reduce(
        (summary, movement) => {
          if (
            movement.type ===
            'ENTRADA'
          ) {
            summary.entry +=
              movement.quantity
          }

          if (
            movement.type ===
            'SAÍDA'
          ) {
            summary.exit +=
              movement.quantity
          }

          if (
            movement.type ===
            'TRANSFERÊNCIA'
          ) {
            summary.transfer +=
              movement.quantity
          }

          return summary
        },
        {
          entry: 0,
          exit: 0,
          transfer: 0,
        },
      )

    return {
      totalUnits,
      stockValue,
      lowStock,
      categories,
      streets,
      sortedMovements,
      movementSummary,
    }
  }, [
    products,
    positions,
    movements,
  ])

  const maxCategoryUnits =
    Math.max(
      ...dashboardData.categories.map(
        (item) => item.units,
      ),
      1,
    )

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

  return (
    <section className="inventory-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="page-eyebrow">
            VISÃO GERAL
          </span>

          <h1>
            Dashboard de estoque
          </h1>

          <p className="page-description">
            Acompanhe os principais
            indicadores e alertas da
            operação em tempo real.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-map-button"
          onClick={() =>
            navigate('/estoque/mapa')
          }
        >
          <MapPin size={15} />
          Abrir mapa
        </button>
      </div>

      <div className="dashboard-kpis">
        <article>
          <div className="dashboard-kpi-icon">
            <Boxes size={18} />
          </div>

          <span>
            Unidades em estoque
          </span>

          <strong>
            {dashboardData.totalUnits.toLocaleString(
              'pt-BR',
            )}
          </strong>

          <small>
            em{' '}
            {positions.length}{' '}
            posições ocupadas
          </small>
        </article>

        <article>
          <div className="dashboard-kpi-icon">
            <PackageSearch
              size={18}
            />
          </div>

          <span>
            SKUs cadastrados
          </span>

          <strong>
            {products.length}
          </strong>

          <small>
            {
              dashboardData.lowStock
                .length
            }{' '}
            exigem atenção
          </small>
        </article>

        <article>
          <div className="dashboard-kpi-icon">
            <TrendingUp size={18} />
          </div>

          <span>
            Valor em estoque
          </span>

          <strong>
            {currencyFormatter.format(
              dashboardData.stockValue,
            )}
          </strong>

          <small>
            custo consolidado
          </small>
        </article>

        <article>
          <div className="dashboard-kpi-icon alert">
            <AlertTriangle
              size={18}
            />
          </div>

          <span>
            Estoque crítico
          </span>

          <strong>
            {
              dashboardData.lowStock
                .length
            }
          </strong>

          <small>
            SKUs no mínimo ou abaixo
          </small>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-category-card">
          <div className="dashboard-card-header">
            <div>
              <strong>
                Estoque por categoria
              </strong>

              <span>
                Distribuição das unidades
                atuais
              </span>
            </div>
          </div>

          <div className="category-bars">
            {dashboardData.categories.map(
              (item) => (
                <div
                  key={
                    item.category
                  }
                  className="category-row"
                >
                  <div className="category-copy">
                    <strong>
                      {
                        item.category
                      }
                    </strong>

                    <span>
                      {item.units}{' '}
                      unidades
                    </span>
                  </div>

                  <div className="category-track">
                    <span
                      style={{
                        width: `${Math.max(
                          7,
                          (item.units /
                            maxCategoryUnits) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <strong>
                Ocupação por rua
              </strong>

              <span>
                Posições físicas ocupadas
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/estoque/mapa',
                )
              }
            >
              Ver mapa
            </button>
          </div>

          <div className="street-occupancy-list">
            {dashboardData.streets.map(
              (street) => (
                <div
                  key={
                    street.street
                  }
                  className="dashboard-street-row"
                >
                  <div>
                    <strong>
                      {street.street}
                    </strong>

                    <span>
                      {
                        street.occupied
                      }
                      /
                      {
                        streetCapacity
                      }{' '}
                      posições
                    </span>
                  </div>

                  <div className="dashboard-street-progress">
                    <span
                      style={{
                        width: `${street.occupancy}%`,
                      }}
                    />
                  </div>

                  <strong className="dashboard-street-percent">
                    {
                      street.occupancy
                    }
                    %
                  </strong>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="dashboard-card dashboard-alert-card">
          <div className="dashboard-card-header">
            <div>
              <strong>
                Alertas de estoque
              </strong>

              <span>
                Produtos no mínimo ou
                abaixo
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/estoque/posicoes',
                )
              }
            >
              Ver inventário
            </button>
          </div>

          <div className="stock-alert-list">
            {dashboardData.lowStock
              .length > 0 ? (
              dashboardData.lowStock
                .slice(0, 5)
                .map((product) => (
                  <button
                    key={
                      product.sku
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        '/estoque/posicoes',
                      )
                    }
                    className="stock-alert-item"
                  >
                    <div className="stock-alert-icon">
                      <AlertTriangle
                        size={15}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          product.sku
                        }
                      </strong>

                      <span>
                        {
                          product.name
                        }
                      </span>
                    </div>

                    <div className="stock-alert-qty">
                      <strong>
                        {
                          product.quantity
                        }
                      </strong>

                      <span>
                        mín.{' '}
                        {
                          product.minimumStock
                        }
                      </span>
                    </div>
                  </button>
                ))
            ) : (
              <div className="dashboard-empty">
                Nenhum SKU em nível
                crítico.
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card dashboard-movement-summary">
          <div className="dashboard-card-header">
            <div>
              <strong>
                Fluxo operacional
              </strong>

              <span>
                Volume movimentado
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/estoque/movimentacoes',
                )
              }
            >
              Histórico
            </button>
          </div>

          <div className="movement-summary-grid">
            <div>
              <ArrowDownToLine
                size={17}
              />

              <span>
                Entradas
              </span>

              <strong>
                {
                  dashboardData
                    .movementSummary
                    .entry
                }
              </strong>
            </div>

            <div>
              <ArrowUpFromLine
                size={17}
              />

              <span>
                Saídas
              </span>

              <strong>
                {
                  dashboardData
                    .movementSummary
                    .exit
                }
              </strong>
            </div>

            <div>
              <ArrowLeftRight
                size={17}
              />

              <span>
                Transferências
              </span>

              <strong>
                {
                  dashboardData
                    .movementSummary
                    .transfer
                }
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article className="dashboard-card dashboard-recent-card">
        <div className="dashboard-card-header">
          <div>
            <strong>
              Atividade recente
            </strong>

            <span>
              Últimas movimentações do
              estoque
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                '/estoque/movimentacoes',
              )
            }
          >
            Ver todas
          </button>
        </div>

        <div className="dashboard-recent-list">
          {dashboardData.sortedMovements.map(
            (movement) => (
              <div
                key={movement.id}
                className="dashboard-recent-item"
              >
                <div
                  className={`recent-movement-icon ${
                    movement.type ===
                    'ENTRADA'
                      ? 'entry'
                      : movement.type ===
                          'SAÍDA'
                        ? 'exit'
                        : 'transfer'
                  }`}
                >
                  {movement.type ===
                  'ENTRADA' ? (
                    <ArrowDownToLine
                      size={15}
                    />
                  ) : movement.type ===
                    'SAÍDA' ? (
                    <ArrowUpFromLine
                      size={15}
                    />
                  ) : (
                    <ArrowLeftRight
                      size={15}
                    />
                  )}
                </div>

                <div className="recent-movement-product">
                  <strong>
                    {movement.sku}
                  </strong>

                  <span>
                    {getProductName(
                      movement.sku,
                    )}
                  </span>
                </div>

                <div className="recent-movement-location">
                  <strong>
                    {movement.origin &&
                    movement.destination
                      ? `${movement.origin} → ${movement.destination}`
                      : movement.origin ??
                        movement.destination ??
                        '—'}
                  </strong>

                  <span>
                    {
                      movement.responsible
                    }
                  </span>
                </div>

                <div className="recent-movement-qty">
                  <strong>
                    {
                      movement.quantity
                    }{' '}
                    un.
                  </strong>

                  <span>
                    {dateFormatter.format(
                      new Date(
                        movement.createdAt,
                      ),
                    )}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </article>
    </section>
  )
}
