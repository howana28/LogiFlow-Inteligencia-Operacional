import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  MapPin,
  PackageSearch,
  X,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import type {
  InventoryMovement,
  MovementType,
} from '../types/logistics'
import './ProductDetailsDrawer.css'

interface ProductDetailsDrawerProps {
  sku: string | null
  onClose: () => void
}

const currencyFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

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
    return `Destino ${movement.destination}`
  }

  if (movement.origin) {
    return `Origem ${movement.origin}`
  }

  return 'Sem endereço informado'
}

export function ProductDetailsDrawer({
  sku,
  onClose,
}: ProductDetailsDrawerProps) {
  const {
    products,
    positions,
    movements,
  } = useInventory()

  if (!sku) {
    return null
  }

  const product = products.find(
    (item) => item.sku === sku,
  )

  if (!product) {
    return null
  }

  const productPositions =
    positions.filter(
      (position) =>
        position.sku === product.sku,
    )

  const recentMovements =
    movements
      .filter(
        (movement) =>
          movement.sku ===
          product.sku,
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      )
      .slice(0, 5)

  const totalUnits =
    productPositions.reduce(
      (total, position) =>
        total + position.quantity,
      0,
    )

  const totalCapacity =
    productPositions.reduce(
      (total, position) =>
        total + position.capacity,
      0,
    )

  const occupancy =
    totalCapacity > 0
      ? Math.round(
          (totalUnits /
            totalCapacity) *
            100,
        )
      : 0

  const stockValue =
    totalUnits * product.unitCost

  const stockStatus =
    totalUnits === 0
      ? 'Indisponível'
      : totalUnits <=
          product.minimumStock
        ? 'Estoque baixo'
        : 'Disponível'

  return (
    <div
      className="product-drawer-backdrop"
      onMouseDown={onClose}
    >
      <aside
        className="product-drawer"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="product-drawer-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
        >
          <X size={19} />
        </button>

        <header className="product-drawer-header">
          <div className="product-drawer-icon">
            <PackageSearch
              size={21}
            />
          </div>

          <span>
            {product.category}
          </span>

          <h2>
            {product.name}
          </h2>

          <p>
            {product.sku} ·{' '}
            {product.brand}
          </p>

          <div
            className={`product-stock-status ${
              stockStatus ===
              'Disponível'
                ? 'available'
                : stockStatus ===
                    'Estoque baixo'
                  ? 'low'
                  : 'unavailable'
            }`}
          >
            {stockStatus}
          </div>
        </header>

        <div className="product-metrics">
          <div>
            <Boxes size={17} />
            <span>
              Estoque total
            </span>
            <strong>
              {totalUnits} un.
            </strong>
          </div>

          <div>
            <MapPin size={17} />
            <span>Posições</span>
            <strong>
              {
                productPositions.length
              }
            </strong>
          </div>

          <div>
            <CircleDollarSign
              size={17}
            />
            <span>
              Valor em estoque
            </span>
            <strong>
              {currencyFormatter.format(
                stockValue,
              )}
            </strong>
          </div>
        </div>

        <section className="product-section">
          <div className="product-section-heading">
            <span>
              Ocupação consolidada
            </span>
            <strong>
              {occupancy}%
            </strong>
          </div>

          <div className="product-progress">
            <span
              style={{
                width: `${Math.min(
                  occupancy,
                  100,
                )}%`,
              }}
            />
          </div>

          <small>
            {totalUnits} de{' '}
            {totalCapacity} unidades
            disponíveis nas posições
            atuais.
          </small>
        </section>

        <section className="product-section">
          <div className="product-section-title">
            Endereços de estoque
          </div>

          <div className="product-position-list">
            {productPositions.length >
            0 ? (
              productPositions.map(
                (position) => (
                  <div
                    key={
                      position.id
                    }
                    className="product-position-item"
                  >
                    <div className="product-position-icon">
                      <MapPin
                        size={16}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          position.position
                        }
                      </strong>

                      <span>
                        {
                          position.street
                        }{' '}
                        ·{' '}
                        {
                          position.zone
                        }
                      </span>
                    </div>

                    <div className="product-position-quantity">
                      <strong>
                        {
                          position.quantity
                        }
                      </strong>

                      <span>
                        /{' '}
                        {
                          position.capacity
                        }{' '}
                        un.
                      </span>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="product-empty-state">
                Nenhuma posição
                atualmente vinculada a
                este SKU.
              </div>
            )}
          </div>
        </section>

        <section className="product-section">
          <div className="product-section-title">
            Últimas movimentações
          </div>

          <div className="product-movement-list">
            {recentMovements.length >
            0 ? (
              recentMovements.map(
                (movement) => {
                  const Icon =
                    getMovementIcon(
                      movement.type,
                    )

                  return (
                    <div
                      key={
                        movement.id
                      }
                      className="product-movement-item"
                    >
                      <div className="product-movement-icon">
                        <Icon
                          size={16}
                        />
                      </div>

                      <div className="product-movement-copy">
                        <strong>
                          {
                            movement.type
                          }{' '}
                          ·{' '}
                          {
                            movement.quantity
                          }{' '}
                          un.
                        </strong>

                        <span>
                          {getMovementLocation(
                            movement,
                          )}
                        </span>

                        <small>
                          {dateFormatter.format(
                            new Date(
                              movement.createdAt,
                            ),
                          )}{' '}
                          ·{' '}
                          {
                            movement.responsible
                          }
                        </small>
                      </div>
                    </div>
                  )
                },
              )
            ) : (
              <div className="product-empty-state">
                Nenhuma movimentação
                recente encontrada.
              </div>
            )}
          </div>
        </section>

        <section className="product-info-grid">
          <div>
            <span>
              Custo unitário
            </span>

            <strong>
              {currencyFormatter.format(
                product.unitCost,
              )}
            </strong>
          </div>

          <div>
            <span>
              Estoque mínimo
            </span>

            <strong>
              {product.minimumStock}{' '}
              un.
            </strong>
          </div>
        </section>
      </aside>
    </div>
  )
}