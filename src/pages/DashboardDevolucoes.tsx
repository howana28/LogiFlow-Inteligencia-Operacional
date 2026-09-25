import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  PackageSearch,
  Plus,
  ScanLine,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'
import { useReturns } from '../context/ReturnsContext'
import './Devolucoes.css'

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export function DashboardDevolucoes() {
  const navigate = useNavigate()
  const { returns } = useReturns()
  const { products } = useInventory()

  const data = useMemo(() => {
    const review = returns.filter(
      (record) =>
        record.status === 'A revisar',
    )

    const conference = returns.filter(
      (record) =>
        record.status ===
        'Em conferência',
    )

    const finished = returns.filter(
      (record) =>
        record.status === 'Finalizada',
    )

    const totalUnits = returns.reduce(
      (sum, record) =>
        sum + record.quantity,
      0,
    )

    const recent = [...returns]
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

    return {
      review,
      conference,
      finished,
      totalUnits,
      recent,
    }
  }, [returns])

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
    <section className="returns-page">
      <div className="returns-heading">
        <div>
          <span className="page-eyebrow">
            LOGÍSTICA REVERSA
          </span>

          <h1>
            Dashboard de devoluções
          </h1>

          <p className="page-description">
            Acompanhe ocorrências,
            pendências e o andamento do
            fluxo de devoluções.
          </p>
        </div>

        <button
          type="button"
          className="returns-primary-button"
          onClick={() =>
            navigate('/devolucoes/nova')
          }
        >
          <Plus size={15} />
          Nova devolução
        </button>
      </div>

      <div className="returns-kpis">
        <article>
          <div className="returns-kpi-icon neutral">
            <ClipboardCheck
              size={18}
            />
          </div>

          <span>
            Devoluções
          </span>

          <strong>
            {returns.length}
          </strong>

          <small>
            {data.totalUnits} unidades
            envolvidas
          </small>
        </article>

        <article>
          <div className="returns-kpi-icon warning">
            <Clock3 size={18} />
          </div>

          <span>
            A revisar
          </span>

          <strong>
            {data.review.length}
          </strong>

          <small>
            aguardando análise
          </small>
        </article>

        <article>
          <div className="returns-kpi-icon conference">
            <ScanLine size={18} />
          </div>

          <span>
            Em conferência
          </span>

          <strong>
            {data.conference.length}
          </strong>

          <small>
            aguardando validação física
          </small>
        </article>

        <article>
          <div className="returns-kpi-icon success">
            <CheckCircle2
              size={18}
            />
          </div>

          <span>
            Finalizadas
          </span>

          <strong>
            {data.finished.length}
          </strong>

          <small>
            fluxo concluído
          </small>
        </article>
      </div>

      <div className="returns-dashboard-grid">
        <article className="returns-card">
          <div className="returns-card-header">
            <div>
              <strong>
                Fila de análise
              </strong>

              <span>
                Ocorrências que exigem
                revisão
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/devolucoes/revisar',
                )
              }
            >
              Ver fila
            </button>
          </div>

          <div className="returns-queue-list">
            {data.review.length > 0 ? (
              data.review
                .slice(0, 5)
                .map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="returns-queue-item"
                    onClick={() =>
                      navigate(
                        '/devolucoes/revisar',
                      )
                    }
                  >
                    <div className="returns-queue-icon">
                      <PackageSearch
                        size={16}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          record.orderNumber
                        }
                      </strong>

                      <span>
                        {record.sku} ·{' '}
                        {getProductName(
                          record.sku,
                        )}
                      </span>
                    </div>

                    <div className="returns-queue-qty">
                      <strong>
                        {record.quantity}
                      </strong>

                      <span>un.</span>
                    </div>
                  </button>
                ))
            ) : (
              <div className="returns-empty">
                Nenhuma devolução
                aguardando revisão.
              </div>
            )}
          </div>
        </article>

        <article className="returns-card">
          <div className="returns-card-header">
            <div>
              <strong>
                Status do fluxo
              </strong>

              <span>
                Distribuição das
                ocorrências
              </span>
            </div>
          </div>

          <div className="returns-status-summary">
            <div>
              <div className="returns-status-copy">
                <strong>
                  A revisar
                </strong>

                <span>
                  {data.review.length}
                </span>
              </div>

              <div className="returns-status-track">
                <span
                  className="review"
                  style={{
                    width: `${
                      returns.length
                        ? (data.review
                            .length /
                            returns.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="returns-status-copy">
                <strong>
                  Em conferência
                </strong>

                <span>
                  {
                    data.conference
                      .length
                  }
                </span>
              </div>

              <div className="returns-status-track">
                <span
                  className="conference"
                  style={{
                    width: `${
                      returns.length
                        ? (data.conference
                            .length /
                            returns.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="returns-status-copy">
                <strong>
                  Finalizadas
                </strong>

                <span>
                  {data.finished.length}
                </span>
              </div>

              <div className="returns-status-track">
                <span
                  className="finished"
                  style={{
                    width: `${
                      returns.length
                        ? (data.finished
                            .length /
                            returns.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="returns-card returns-recent-card">
        <div className="returns-card-header">
          <div>
            <strong>
              Últimos lançamentos
            </strong>

            <span>
              Atividade recente de
              logística reversa
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                '/devolucoes/ultimos',
              )
            }
          >
            Ver todos
          </button>
        </div>

        <div className="returns-recent-list">
          {data.recent.map(
            (record) => (
              <div
                key={record.id}
                className="returns-recent-item"
              >
                <div
                  className={`returns-status-dot ${
                    record.status ===
                    'A revisar'
                      ? 'review'
                      : record.status ===
                          'Em conferência'
                        ? 'conference'
                        : 'finished'
                  }`}
                />

                <div>
                  <strong>
                    {record.orderNumber}
                  </strong>

                  <span>
                    {record.sku} ·{' '}
                    {getProductName(
                      record.sku,
                    )}
                  </span>
                </div>

                <div>
                  <strong>
                    {record.status}
                  </strong>

                  <span>
                    {record.quantity} un.
                  </span>
                </div>

                <div className="returns-recent-date">
                  {dateFormatter.format(
                    new Date(
                      record.createdAt,
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </article>
    </section>
  )
}
