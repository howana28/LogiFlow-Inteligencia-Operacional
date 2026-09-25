import {
  ArrowLeftRight,
  Box,
  Boxes,
  MapPinned,
  PackageOpen,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  inventoryPositions,
  movements,
  products,
} from '../data/mockData'
import type { InventoryPosition } from '../types/logistics'
import './MapaEstoque.css'

type StreetConfig = {
  name: string
  zone: string
  prefix: string
}

type SelectedPosition = {
  code: string
  street: string
  data?: InventoryPosition
}

const streets: StreetConfig[] = [
  {
    name: 'Rua A',
    zone: 'Zona A',
    prefix: 'A',
  },
  {
    name: 'Rua B',
    zone: 'Zona A',
    prefix: 'B',
  },
  {
    name: 'Rua C',
    zone: 'Zona B',
    prefix: 'C',
  },
  {
    name: 'Rua D',
    zone: 'Zona B',
    prefix: 'D',
  },
]

const positionsPerStreet = 6

function getProduct(sku?: string) {
  if (!sku) {
    return undefined
  }

  return products.find((product) => product.sku === sku)
}

function getPositionStatus(position?: InventoryPosition) {
  if (!position) {
    return 'empty'
  }

  const occupancy =
    position.capacity > 0
      ? position.quantity / position.capacity
      : 0

  if (occupancy >= 0.8) {
    return 'high'
  }

  if (occupancy >= 0.5) {
    return 'normal'
  }

  return 'available'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function MapaEstoque() {
  const [selectedStreet, setSelectedStreet] =
    useState<string | null>(null)

  const [selectedPosition, setSelectedPosition] =
    useState<SelectedPosition | null>(null)

  const [search, setSearch] = useState('')

  const [actionMessage, setActionMessage] =
    useState<string | null>(null)

  const streetSummaries = useMemo(() => {
    return streets.map((street) => {
      const positions = inventoryPositions.filter(
        (position) => position.street === street.name,
      )

      const totalUnits = positions.reduce(
        (total, position) => total + position.quantity,
        0,
      )

      const occupiedPositions = positions.length

      const occupancy = Math.round(
        (occupiedPositions / positionsPerStreet) * 100,
      )

      return {
        ...street,
        positions,
        totalUnits,
        occupiedPositions,
        occupancy,
      }
    })
  }, [])

  const selectedStreetData = streetSummaries.find(
    (street) => street.name === selectedStreet,
  )

  const selectedProduct = getProduct(
    selectedPosition?.data?.sku,
  )

  const lastMovement = selectedPosition?.data
    ? [...movements]
        .filter(
          (movement) =>
            movement.sku === selectedPosition.data?.sku,
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        )[0]
    : undefined

  function closeDrawer() {
    setSelectedStreet(null)
    setSelectedPosition(null)
    setActionMessage(null)
  }

  function openStreet(streetName: string) {
    setSelectedPosition(null)
    setActionMessage(null)
    setSelectedStreet(streetName)
  }

  function openPosition(
    streetName: string,
    code: string,
    data?: InventoryPosition,
  ) {
    setSelectedStreet(null)
    setActionMessage(null)

    setSelectedPosition({
      street: streetName,
      code,
      data,
    })
  }

  const filteredStreetSummaries = streetSummaries.map(
    (street) => {
      if (!search.trim()) {
        return street
      }

      const term = search.trim().toLowerCase()

      const matchingPositions = street.positions.filter(
        (position) => {
          const product = getProduct(position.sku)

          return (
            position.position
              .toLowerCase()
              .includes(term) ||
            position.sku.toLowerCase().includes(term) ||
            product?.name.toLowerCase().includes(term) ||
            product?.category
              .toLowerCase()
              .includes(term)
          )
        },
      )

      return {
        ...street,
        hasSearchMatch:
          street.name.toLowerCase().includes(term) ||
          matchingPositions.length > 0,
      }
    },
  )

  return (
    <section className="inventory-map-page">
      <div className="inventory-page-header">
        <div>
          <span className="page-eyebrow">
            ENDEREÇAMENTO
          </span>

          <h1>Mapa de estoque</h1>

          <p className="page-description">
            Visualize a ocupação física do armazém e
            consulte os SKUs alocados em cada endereço.
          </p>
        </div>

        <div className="inventory-summary">
          <span>
            {inventoryPositions.length} posições ocupadas
          </span>

          <strong>
            {inventoryPositions
              .reduce(
                (total, position) =>
                  total + position.quantity,
                0,
              )
              .toLocaleString('pt-BR')}{' '}
            unidades
          </strong>
        </div>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={16} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar por SKU, produto, categoria ou posição"
          />
        </div>

        <div className="occupancy-legend">
          <span>
            <i className="legend-dot available" />
            Disponível
          </span>

          <span>
            <i className="legend-dot normal" />
            Ocupação normal
          </span>

          <span>
            <i className="legend-dot high" />
            Alta ocupação
          </span>

          <span>
            <i className="legend-dot empty" />
            Vazio
          </span>
        </div>
      </div>

      <div className="warehouse-grid">
        {filteredStreetSummaries.map((street) => {
          const dimmed =
            'hasSearchMatch' in street &&
            street.hasSearchMatch === false

          return (
            <article
              key={street.name}
              className={`warehouse-street ${
                dimmed ? 'search-dimmed' : ''
              }`}
            >
              <button
                className="street-header"
                type="button"
                onClick={() =>
                  openStreet(street.name)
                }
              >
                <div>
                  <span>{street.zone}</span>
                  <strong>{street.name}</strong>
                </div>

                <div className="street-occupancy">
                  <strong>
                    {street.occupancy}%
                  </strong>

                  <span>ocupado</span>
                </div>
              </button>

              <div className="street-stats">
                <span>
                  {street.occupiedPositions}/
                  {positionsPerStreet} posições
                </span>

                <span>
                  {street.totalUnits} unidades
                </span>
              </div>

              <div className="street-position-grid">
                {Array.from(
                  {
                    length: positionsPerStreet,
                  },
                  (_, index) => {
                    const code = `${street.prefix}-${String(
                      index + 1,
                    ).padStart(2, '0')}`

                    const position =
                      inventoryPositions.find(
                        (item) =>
                          item.position === code,
                      )

                    const status =
                      getPositionStatus(position)

                    const product = getProduct(
                      position?.sku,
                    )

                    const matchesSearch =
                      !search.trim() ||
                      street.name
                        .toLowerCase()
                        .includes(
                          search
                            .trim()
                            .toLowerCase(),
                        ) ||
                      code
                        .toLowerCase()
                        .includes(
                          search
                            .trim()
                            .toLowerCase(),
                        ) ||
                      position?.sku
                        .toLowerCase()
                        .includes(
                          search
                            .trim()
                            .toLowerCase(),
                        ) ||
                      product?.name
                        .toLowerCase()
                        .includes(
                          search
                            .trim()
                            .toLowerCase(),
                        )

                    return (
                      <button
                        key={code}
                        type="button"
                        className={`warehouse-position ${status} ${
                          !matchesSearch &&
                          search.trim()
                            ? 'position-dimmed'
                            : ''
                        }`}
                        onClick={() =>
                          openPosition(
                            street.name,
                            code,
                            position,
                          )
                        }
                      >
                        <strong>{code}</strong>

                        {position ? (
                          <>
                            <span>
                              {position.sku}
                            </span>

                            <small>
                              {position.quantity}/
                              {position.capacity} un.
                            </small>
                          </>
                        ) : (
                          <>
                            <span>Livre</span>
                            <small>
                              Sem SKU alocado
                            </small>
                          </>
                        )}
                      </button>
                    )
                  },
                )}
              </div>
            </article>
          )
        })}
      </div>

      {(selectedStreet || selectedPosition) && (
        <div
          className="inventory-drawer-backdrop"
          onMouseDown={closeDrawer}
        >
          <aside
            className="inventory-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="drawer-close"
              onClick={closeDrawer}
              aria-label="Fechar painel"
            >
              <X size={19} />
            </button>

            {selectedStreetData && (
              <>
                <div className="drawer-heading">
                  <div className="drawer-icon">
                    <MapPinned size={20} />
                  </div>

                  <span>
                    {selectedStreetData.zone}
                  </span>

                  <h2>
                    {selectedStreetData.name}
                  </h2>

                  <p>
                    Visão consolidada dos endereços e
                    produtos armazenados nesta rua.
                  </p>
                </div>

                <div className="drawer-metrics">
                  <div>
                    <span>Ocupação</span>
                    <strong>
                      {
                        selectedStreetData.occupancy
                      }
                      %
                    </strong>
                  </div>

                  <div>
                    <span>Posições</span>
                    <strong>
                      {
                        selectedStreetData.occupiedPositions
                      }
                      /{positionsPerStreet}
                    </strong>
                  </div>

                  <div>
                    <span>Unidades</span>
                    <strong>
                      {
                        selectedStreetData.totalUnits
                      }
                    </strong>
                  </div>
                </div>

                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <div>
                      <span>SKUs alocados</span>
                      <strong>
                        {
                          selectedStreetData
                            .positions.length
                        }{' '}
                        registros
                      </strong>
                    </div>
                  </div>

                  <div className="drawer-product-list">
                    {selectedStreetData.positions.map(
                      (position) => {
                        const product = getProduct(
                          position.sku,
                        )

                        return (
                          <button
                            type="button"
                            key={position.id}
                            className="drawer-product"
                            onClick={() =>
                              openPosition(
                                selectedStreetData.name,
                                position.position,
                                position,
                              )
                            }
                          >
                            <div className="drawer-product-icon">
                              <Box size={17} />
                            </div>

                            <div className="drawer-product-copy">
                              <strong>
                                {position.sku}
                              </strong>

                              <span>
                                {product?.name ??
                                  'Produto'}
                              </span>

                              <small>
                                {
                                  position.position
                                }
                              </small>
                            </div>

                            <div className="drawer-product-qty">
                              <strong>
                                {
                                  position.quantity
                                }
                              </strong>
                              <span>un.</span>
                            </div>
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedPosition && (
              <>
                <div className="drawer-heading">
                  <div className="drawer-icon">
                    {selectedPosition.data ? (
                      <Boxes size={20} />
                    ) : (
                      <PackageOpen size={20} />
                    )}
                  </div>

                  <span>
                    {selectedPosition.street}
                  </span>

                  <h2>
                    Posição{' '}
                    {selectedPosition.code}
                  </h2>

                  <p>
                    {selectedPosition.data
                      ? 'Detalhes do produto e da ocupação atual deste endereço.'
                      : 'Esta posição está disponível para receber um novo SKU.'}
                  </p>
                </div>

                {selectedPosition.data &&
                selectedProduct ? (
                  <>
                    <div className="position-occupancy-card">
                      <div>
                        <span>
                          Ocupação atual
                        </span>

                        <strong>
                          {Math.round(
                            (selectedPosition.data
                              .quantity /
                              selectedPosition.data
                                .capacity) *
                              100,
                          )}
                          %
                        </strong>
                      </div>

                      <div className="occupancy-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (selectedPosition
                                  .data.quantity /
                                  selectedPosition
                                    .data.capacity) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>

                      <small>
                        {
                          selectedPosition.data
                            .quantity
                        }{' '}
                        de{' '}
                        {
                          selectedPosition.data
                            .capacity
                        }{' '}
                        unidades
                      </small>
                    </div>

                    <div className="drawer-info-list">
                      <div>
                        <span>SKU</span>
                        <strong>
                          {selectedProduct.sku}
                        </strong>
                      </div>

                      <div>
                        <span>Produto</span>
                        <strong>
                          {selectedProduct.name}
                        </strong>
                      </div>

                      <div>
                        <span>Categoria</span>
                        <strong>
                          {
                            selectedProduct.category
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Marca</span>
                        <strong>
                          {selectedProduct.brand}
                        </strong>
                      </div>

                      <div>
                        <span>Quantidade</span>
                        <strong>
                          {
                            selectedPosition.data
                              .quantity
                          }{' '}
                          unidades
                        </strong>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <div className="drawer-section-title">
                        <div>
                          <span>
                            Última movimentação
                          </span>
                        </div>
                      </div>

                      {lastMovement ? (
                        <div className="last-movement">
                          <div className="movement-icon">
                            <ArrowLeftRight
                              size={16}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                lastMovement.type
                              }{' '}
                              ·{' '}
                              {
                                lastMovement.quantity
                              }{' '}
                              un.
                            </strong>

                            <span>
                              {formatDate(
                                lastMovement.createdAt,
                              )}
                            </span>

                            <small>
                              {
                                lastMovement.responsible
                              }
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-movement">
                          Nenhuma movimentação recente
                          encontrada.
                        </div>
                      )}
                    </div>

                    {actionMessage && (
                      <div className="drawer-action-message">
                        {actionMessage}
                      </div>
                    )}

                    <div className="drawer-actions">
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() =>
                          setActionMessage(
                            'O histórico completo deste SKU será conectado ao módulo de movimentações no próximo fluxo.',
                          )
                        }
                      >
                        Ver histórico
                      </button>

                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() =>
                          setActionMessage(
                            'A transferência entre posições será implementada no fluxo de movimentações.',
                          )
                        }
                      >
                        Transferir
                      </button>

                      <button
                        type="button"
                        className="primary-action"
                        onClick={() =>
                          setActionMessage(
                            'A retirada será conectada ao fluxo operacional de estoque no commit dedicado.',
                          )
                        }
                      >
                        Registrar retirada
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-position-card">
                    <PackageOpen size={24} />

                    <strong>
                      Endereço disponível
                    </strong>

                    <span>
                      Nenhum SKU está alocado em{' '}
                      {selectedPosition.code}.
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setActionMessage(
                          'A alocação será conectada ao fluxo de entrada de estoque.',
                        )
                      }
                    >
                      Alocar produto
                    </button>

                    {actionMessage && (
                      <div className="drawer-action-message">
                        {actionMessage}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}