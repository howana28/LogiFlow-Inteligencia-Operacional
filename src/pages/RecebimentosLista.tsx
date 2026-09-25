import {
  ArrowRight,
  CheckCircle2,
  Search,
  Truck,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { useReceiving } from '../context/ReceivingContext'
import './Recebimento.css'

interface RecebimentosListaProps {
  mode: 'transit' | 'processed'
}

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export function RecebimentosLista({
  mode,
}: RecebimentosListaProps) {
  const {
    receivingRecords,
    startConference,
  } = useReceiving()

  const [search, setSearch] =
    useState('')

  const [feedback, setFeedback] =
    useState<string | null>(null)

  const rows = useMemo(() => {
    const expectedStatus =
      mode === 'transit'
        ? 'A caminho'
        : 'Processado'

    const term = search
      .trim()
      .toLowerCase()

    return receivingRecords
      .filter(
        (record) =>
          record.status ===
          expectedStatus,
      )
      .filter((record) => {
        if (!term) {
          return true
        }

        return (
          record.supplier
            .toLowerCase()
            .includes(term) ||
          record.purchaseNumber
            ?.toLowerCase()
            .includes(term) ||
          record.lines?.some((line) =>
            line.sku
              .toLowerCase()
              .includes(term),
          )
        )
      })
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
  }, [
    receivingRecords,
    mode,
    search,
  ])

  function handleStart(
    id: string,
    purchaseNumber?: string,
  ) {
    try {
      startConference(
        id,
        'Ana Mendes',
      )

      setFeedback(
        `${purchaseNumber ?? 'Recebimento'} foi encaminhado para conferência.`,
      )
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a conferência.',
      )
    }
  }

  return (
    <section className="receiving-page">
      <div className="receiving-heading">
        <div>
          <span className="page-eyebrow">
            {mode === 'transit'
              ? 'PREVISÃO'
              : 'HISTÓRICO'}
          </span>

          <h1>
            {mode === 'transit'
              ? 'Cargas a caminho'
              : 'Recebimentos processados'}
          </h1>

          <p className="page-description">
            {mode === 'transit'
              ? 'Acompanhe as ordens previstas e inicie a conferência quando a carga chegar.'
              : 'Consulte recebimentos concluídos e divergências identificadas.'}
          </p>
        </div>
      </div>

      <div className="receiving-toolbar">
        <div className="receiving-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar ordem, fornecedor ou SKU"
          />
        </div>
      </div>

      {feedback && (
        <div className="receiving-feedback">
          {feedback}
        </div>
      )}

      <div className="receiving-table-card">
        <div className="receiving-card-header">
          <div>
            <strong>
              {mode === 'transit'
                ? 'Ordens previstas'
                : 'Recebimentos concluídos'}
            </strong>

            <span>
              {rows.length}{' '}
              registros encontrados
            </span>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="receiving-table-wrapper">
            <table className="receiving-table">
              <thead>
                <tr>
                  <th>Previsão</th>
                  <th>Ordem</th>
                  <th>Fornecedor</th>
                  <th>Itens</th>
                  <th>
                    {mode === 'processed'
                      ? 'Recebido'
                      : 'Previsto'}
                  </th>

                  {mode ===
                    'processed' && (
                    <th>
                      Divergências
                    </th>
                  )}

                  <th>Status</th>

                  {mode ===
                    'transit' && (
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
                            `${record.expectedDate}T12:00:00`,
                          ),
                        )}
                      </td>

                      <td>
                        <strong className="receiving-order">
                          {
                            record.purchaseNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {record.supplier}
                      </td>

                      <td>
                        {record.items}{' '}
                        SKUs
                      </td>

                      <td>
                        <strong>
                          {mode ===
                          'processed'
                            ? record.receivedUnits ??
                              0
                            : record.units}
                        </strong>{' '}
                        un.
                      </td>

                      {mode ===
                        'processed' && (
                        <td>
                          <span
                            className={`receiving-discrepancy ${
                              (record.discrepancyCount ??
                                0) >
                              0
                                ? 'has'
                                : 'none'
                            }`}
                          >
                            {
                              record.discrepancyCount ??
                              0
                            }
                          </span>
                        </td>
                      )}

                      <td>
                        <span
                          className={`receiving-status ${
                            mode ===
                            'transit'
                              ? 'transit'
                              : 'processed'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {mode ===
                        'transit' && (
                        <td>
                          <button
                            type="button"
                            className="receiving-row-action"
                            onClick={() =>
                              handleStart(
                                record.id,
                                record.purchaseNumber,
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
          <div className="receiving-empty receiving-empty-large">
            {mode === 'transit' ? (
              <>
                <Truck size={23} />
                <strong>
                  Nenhuma carga a caminho
                </strong>
              </>
            ) : (
              <>
                <CheckCircle2
                  size={23}
                />
                <strong>
                  Nenhum recebimento
                  processado
                </strong>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
