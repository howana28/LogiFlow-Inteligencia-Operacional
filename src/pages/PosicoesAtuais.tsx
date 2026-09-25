import {
  Boxes,
  CircleDollarSign,
  MapPin,
  PackageSearch,
  Search,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { ProductDetailsDrawer } from '../components/ProductDetailsDrawer'
import {
  inventoryPositions,
  products,
} from '../data/mockData'
import './PosicoesAtuais.css'

const currencyFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export function PosicoesAtuais() {
  const [search, setSearch] =
    useState('')

  const [category, setCategory] =
    useState('Todas')

  const [selectedSku, setSelectedSku] =
    useState<string | null>(null)

  const inventoryRows = useMemo(
    () =>
      products.map((product) => {
        const positions =
          inventoryPositions.filter(
            (position) =>
              position.sku ===
              product.sku,
          )

        const totalQuantity =
          positions.reduce(
            (total, position) =>
              total +
              position.quantity,
            0,
          )

        const status =
          totalQuantity === 0
            ? 'Indisponível'
            : totalQuantity <=
                product.minimumStock
              ? 'Estoque baixo'
              : 'Disponível'

        return {
          product,
          positions,
          totalQuantity,
          status,
          stockValue:
            totalQuantity *
            product.unitCost,
        }
      }),
    [],
  )

  const categories = [
    'Todas',
    ...Array.from(
      new Set(
        products.map(
          (product) =>
            product.category,
        ),
      ),
    ),
  ]

  const filteredRows =
    inventoryRows.filter((row) => {
      const term = search
        .trim()
        .toLowerCase()

      const matchesSearch =
        !term ||
        row.product.sku
          .toLowerCase()
          .includes(term) ||
        row.product.name
          .toLowerCase()
          .includes(term) ||
        row.product.brand
          .toLowerCase()
          .includes(term) ||
        row.positions.some(
          (position) =>
            position.position
              .toLowerCase()
              .includes(term),
        )

      const matchesCategory =
        category === 'Todas' ||
        row.product.category ===
          category

      return (
        matchesSearch &&
        matchesCategory
      )
    })

  const totalUnits =
    inventoryRows.reduce(
      (total, row) =>
        total + row.totalQuantity,
      0,
    )

  const totalValue =
    inventoryRows.reduce(
      (total, row) =>
        total + row.stockValue,
      0,
    )

  return (
    <section className="positions-page">
      <div className="positions-heading">
        <div>
          <span className="page-eyebrow">
            INVENTÁRIO
          </span>

          <h1>Posições atuais</h1>

          <p className="page-description">
            Consulte produtos,
            quantidades e endereços
            atualmente ocupados.
          </p>
        </div>
      </div>

      <div className="positions-kpis">
        <div>
          <PackageSearch size={18} />
          <span>SKUs cadastrados</span>
          <strong>
            {products.length}
          </strong>
        </div>

        <div>
          <Boxes size={18} />
          <span>Unidades em estoque</span>
          <strong>
            {totalUnits.toLocaleString(
              'pt-BR',
            )}
          </strong>
        </div>

        <div>
          <MapPin size={18} />
          <span>Posições ocupadas</span>
          <strong>
            {
              inventoryPositions.length
            }
          </strong>
        </div>

        <div>
          <CircleDollarSign
            size={18}
          />
          <span>Valor em estoque</span>
          <strong>
            {currencyFormatter.format(
              totalValue,
            )}
          </strong>
        </div>
      </div>

      <div className="positions-toolbar">
        <div className="positions-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar SKU, produto, marca ou posição"
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value,
            )
          }
        >
          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="positions-table-card">
        <div className="positions-table-header">
          <div>
            <strong>
              Inventário atual
            </strong>

            <span>
              {filteredRows.length}{' '}
              produtos encontrados
            </span>
          </div>
        </div>

        <div className="positions-table-wrapper">
          <table className="positions-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Endereço</th>
                <th>Quantidade</th>
                <th>Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(
                (row) => (
                  <tr
                    key={
                      row.product.sku
                    }
                    tabIndex={0}
                    onClick={() =>
                      setSelectedSku(
                        row.product.sku,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                          'Enter' ||
                        event.key ===
                          ' '
                      ) {
                        setSelectedSku(
                          row.product
                            .sku,
                        )
                      }
                    }}
                  >
                    <td>
                      <button
                        type="button"
                        className="sku-link"
                      >
                        {
                          row.product.sku
                        }
                      </button>
                    </td>

                    <td>
                      <strong className="product-name">
                        {
                          row.product
                            .name
                        }
                      </strong>

                      <span className="product-brand">
                        {
                          row.product
                            .brand
                        }
                      </span>
                    </td>

                    <td>
                      {
                        row.product
                          .category
                      }
                    </td>

                    <td>
                      {row.positions
                        .map(
                          (position) =>
                            position.position,
                        )
                        .join(', ') ||
                        '—'}
                    </td>

                    <td>
                      <strong>
                        {
                          row.totalQuantity
                        }
                      </strong>{' '}
                      un.
                    </td>

                    <td>
                      {
                        row.product
                          .minimumStock
                      }{' '}
                      un.
                    </td>

                    <td>
                      <span
                        className={`inventory-status ${
                          row.status ===
                          'Disponível'
                            ? 'available'
                            : row.status ===
                                'Estoque baixo'
                              ? 'low'
                              : 'unavailable'
                        }`}
                      >
                        {
                          row.status
                        }
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
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