import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  PackagePlus,
  Truck,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReceiving } from '../context/ReceivingContext'
import './Recebimento.css'

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export function DashboardRecebimento() {
  const navigate = useNavigate()
  const { receivingRecords } =
    useReceiving()

  const data = useMemo(() => {
    const inTransit =
      receivingRecords.filter(
        (record) =>
          record.status ===
          'A caminho',
      )

    const checking =
      receivingRecords.filter(
        (record) =>
          record.status ===
          'Em conferência',
      )

    const processed =
      receivingRecords.filter(
        (record) =>
          record.status ===
          'Processado',
      )

    const expectedUnits =
      receivingRecords.reduce(
        (sum, record) =>
          sum + record.units,
        0,
      )

    const discrepancies =
      processed.reduce(
        (sum, record) =>
          sum +
          (record.discrepancyCount ??
            0),
        0,
      )

    const recent =
      [...receivingRecords]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt ??
                b.expectedDate,
            ).getTime() -
            new Date(
              a.createdAt ??
                a.expectedDate,
            ).getTime(),
        )
        .slice(0, 6)

    return {
      inTransit,
      checking,
      processed,
      expectedUnits,
      discrepancies,
      recent,
    }
  }, [receivingRecords])

  return (
    <section className="receiving-page">
      <div className="receiving-heading">
        <div>
          <span className="page-eyebrow">
            ENTRADA DE CARGAS
          </span>

          <h1>
            Dashboard de recebimento
          </h1>

          <p className="page-description">
            Acompanhe compras previstas,
            conferências e divergências
            antes da entrada no estoque.
          </p>
        </div>

        <button
          type="button"
          className="receiving-primary-button"
          onClick={() =>
            navigate(
              '/recebimento/lancar',
            )
          }
        >
          <PackagePlus size={15} />
          Lançar compra
        </button>
      </div>

      <div className="receiving-kpis">
        <article>
          <div className="receiving-kpi-icon transit">
            <Truck size={18} />
          </div>

          <span>A caminho</span>

          <strong>
            {data.inTransit.length}
          </strong>

          <small>
            cargas aguardadas
          </small>
        </article>

        <article>
          <div className="receiving-kpi-icon checking">
            <ClipboardList
              size={18}
            />
          </div>

          <span>
            Em conferência
          </span>

          <strong>
            {data.checking.length}
          </strong>

          <small>
            cargas em validação
          </small>
        </article>

        <article>
          <div className="receiving-kpi-icon success">
            <CheckCircle2
              size={18}
            />
          </div>

          <span>Processados</span>

          <strong>
            {data.processed.length}
          </strong>

          <small>
            recebimentos concluídos
          </small>
        </article>

        <article>
          <div className="receiving-kpi-icon warning">
            <AlertTriangle
              size={18}
            />
          </div>

          <span>Divergências</span>

          <strong>
            {data.discrepancies}
          </strong>

          <small>
            itens com diferença
          </small>
        </article>
      </div>

      <div className="receiving-dashboard-grid">
        <article className="receiving-card">
          <div className="receiving-card-header">
            <div>
              <strong>
                Próximas chegadas
              </strong>

              <span>
                Cargas ainda em trânsito
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/recebimento/caminho',
                )
              }
            >
              Ver cargas
            </button>
          </div>

          <div className="receiving-queue-list">
            {data.inTransit.length >
            0 ? (
              data.inTransit
                .slice(0, 5)
                .map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="receiving-queue-item"
                    onClick={() =>
                      navigate(
                        '/recebimento/caminho',
                      )
                    }
                  >
                    <div className="receiving-queue-icon">
                      <Truck
                        size={16}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          record.purchaseNumber
                        }
                      </strong>

                      <span>
                        {
                          record.supplier
                        }
                      </span>
                    </div>

                    <div className="receiving-queue-meta">
                      <strong>
                        {record.units}{' '}
                        un.
                      </strong>

                      <span>
                        {dateFormatter.format(
                          new Date(
                            `${record.expectedDate}T12:00:00`,
                          ),
                        )}
                      </span>
                    </div>
                  </button>
                ))
            ) : (
              <div className="receiving-empty">
                Nenhuma carga a caminho.
              </div>
            )}
          </div>
        </article>

        <article className="receiving-card">
          <div className="receiving-card-header">
            <div>
              <strong>
                Visão operacional
              </strong>

              <span>
                Volume previsto das ordens
              </span>
            </div>
          </div>

          <div className="receiving-volume-panel">
            <span>
              Unidades previstas
            </span>

            <strong>
              {data.expectedUnits.toLocaleString(
                'pt-BR',
              )}
            </strong>

            <small>
              distribuídas em{' '}
              {
                receivingRecords.length
              }{' '}
              recebimentos
            </small>

            <div className="receiving-flow-line">
              <div>
                <strong>
                  {
                    data.inTransit
                      .length
                  }
                </strong>
                <span>
                  em trânsito
                </span>
              </div>

              <div>
                <strong>
                  {
                    data.checking
                      .length
                  }
                </strong>
                <span>
                  conferindo
                </span>
              </div>

              <div>
                <strong>
                  {
                    data.processed
                      .length
                  }
                </strong>
                <span>
                  concluídos
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="receiving-card">
        <div className="receiving-card-header">
          <div>
            <strong>
              Atividade recente
            </strong>

            <span>
              Últimos recebimentos
              movimentados
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                '/recebimento/processados',
              )
            }
          >
            Ver processados
          </button>
        </div>

        <div className="receiving-recent-list">
          {data.recent.map(
            (record) => (
              <div
                key={record.id}
                className="receiving-recent-item"
              >
                <div
                  className={`receiving-status-dot ${
                    record.status ===
                    'A caminho'
                      ? 'transit'
                      : record.status ===
                          'Em conferência'
                        ? 'checking'
                        : 'processed'
                  }`}
                />

                <div>
                  <strong>
                    {
                      record.purchaseNumber
                    }
                  </strong>

                  <span>
                    {record.supplier}
                  </span>
                </div>

                <div>
                  <strong>
                    {record.status}
                  </strong>

                  <span>
                    {record.items} SKUs ·{' '}
                    {record.units} un.
                  </span>
                </div>

                <div className="receiving-recent-date">
                  {dateFormatter.format(
                    new Date(
                      `${record.expectedDate}T12:00:00`,
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
