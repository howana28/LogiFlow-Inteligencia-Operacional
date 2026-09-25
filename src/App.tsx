import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import {
  administrationNavigation,
  modules,
} from './config/navigation'
import { DemoSessionSwitcher } from './components/DemoSessionSwitcher'
import { RequirePermission } from './components/RequirePermission'
import { AppLayout } from './layouts/AppLayout'
import { ConferenciaDevolucoes } from './pages/ConferenciaDevolucoes'
import { ConferenciaRecebimento } from './pages/ConferenciaRecebimento'
import { DashboardDevolucoes } from './pages/DashboardDevolucoes'
import { DashboardEstoque } from './pages/DashboardEstoque'
import { DashboardRecebimento } from './pages/DashboardRecebimento'
import { DevolucoesLista } from './pages/DevolucoesLista'
import { EntradaEstoque } from './pages/EntradaEstoque'
import { LancarCompra } from './pages/LancarCompra'
import { MapaEstoque } from './pages/MapaEstoque'
import { ModulePage } from './pages/ModulePage'
import { MovimentacoesEstoque } from './pages/MovimentacoesEstoque'
import { NovaDevolucao } from './pages/NovaDevolucao'
import { PosicoesAtuais } from './pages/PosicoesAtuais'
import { RecebimentosLista } from './pages/RecebimentosLista'
import { RetiradaEstoque } from './pages/RetiradaEstoque'
import { Usuarios } from './pages/Usuarios'

const functionalInventoryRoutes = [
  '/estoque/dashboard',
  '/estoque/entrada',
  '/estoque/retirada',
  '/estoque/movimentacoes',
  '/estoque/mapa',
  '/estoque/posicoes',
]

const functionalReturnsRoutes = [
  '/devolucoes/dashboard',
  '/devolucoes/nova',
  '/devolucoes/revisar',
  '/devolucoes/conferencia',
  '/devolucoes/ultimos',
  '/devolucoes/todas',
]

const functionalReceivingRoutes = [
  '/recebimento/dashboard',
  '/recebimento/lancar',
  '/recebimento/caminho',
  '/recebimento/conferencia',
  '/recebimento/processados',
]

function App() {
  return (
    <>
      <DemoSessionSwitcher />

      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                to="/estoque/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <Navigate
                to="/estoque/dashboard"
                replace
              />
            }
          />

          <Route
            path="/estoque/dashboard"
            element={
              <RequirePermission permission="inventory.view">
                <DashboardEstoque />
              </RequirePermission>
            }
          />

          <Route
            path="/estoque/entrada"
            element={
              <RequirePermission permission="inventory.entry">
                <EntradaEstoque />
              </RequirePermission>
            }
          />

          <Route
            path="/estoque/retirada"
            element={
              <RequirePermission permission="inventory.withdrawal">
                <RetiradaEstoque />
              </RequirePermission>
            }
          />

          <Route
            path="/estoque/movimentacoes"
            element={
              <RequirePermission permission="inventory.view">
                <MovimentacoesEstoque />
              </RequirePermission>
            }
          />

          <Route
            path="/estoque/mapa"
            element={
              <RequirePermission permission="inventory.view">
                <MapaEstoque />
              </RequirePermission>
            }
          />

          <Route
            path="/estoque/posicoes"
            element={
              <RequirePermission permission="inventory.view">
                <PosicoesAtuais />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/dashboard"
            element={
              <RequirePermission permission="returns.view">
                <DashboardDevolucoes />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/nova"
            element={
              <RequirePermission permission="returns.manage">
                <NovaDevolucao />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/revisar"
            element={
              <RequirePermission permission="returns.manage">
                <DevolucoesLista
                  mode="review"
                />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/conferencia"
            element={
              <RequirePermission permission="returns.conference">
                <ConferenciaDevolucoes />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/ultimos"
            element={
              <RequirePermission permission="returns.view">
                <DevolucoesLista
                  mode="recent"
                />
              </RequirePermission>
            }
          />

          <Route
            path="/devolucoes/todas"
            element={
              <RequirePermission permission="returns.view">
                <DevolucoesLista
                  mode="all"
                />
              </RequirePermission>
            }
          />

          <Route
            path="/recebimento/dashboard"
            element={
              <RequirePermission permission="receiving.view">
                <DashboardRecebimento />
              </RequirePermission>
            }
          />

          <Route
            path="/recebimento/lancar"
            element={
              <RequirePermission permission="receiving.manage">
                <LancarCompra />
              </RequirePermission>
            }
          />

          <Route
            path="/recebimento/caminho"
            element={
              <RequirePermission permission="receiving.manage">
                <RecebimentosLista
                  mode="transit"
                />
              </RequirePermission>
            }
          />

          <Route
            path="/recebimento/conferencia"
            element={
              <RequirePermission permission="receiving.conference">
                <ConferenciaRecebimento />
              </RequirePermission>
            }
          />

          <Route
            path="/recebimento/processados"
            element={
              <RequirePermission permission="receiving.view">
                <RecebimentosLista
                  mode="processed"
                />
              </RequirePermission>
            }
          />

          {modules.flatMap((module) =>
            module.items
              .filter(
                (item) =>
                  ![
                    ...functionalInventoryRoutes,
                    ...functionalReturnsRoutes,
                    ...functionalReceivingRoutes,
                  ].includes(item.path),
              )
              .map((item) => (
                <Route
                  key={item.path}
                  path={item.path}
                  element={
                    <ModulePage
                      eyebrow={item.eyebrow}
                      title={item.title}
                      description={item.description}
                    />
                  }
                />
              )),
          )}

          <Route
            path={administrationNavigation.path}
            element={
              <RequirePermission permission="users.view">
                <Usuarios />
              </RequirePermission>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/estoque/dashboard"
                replace
              />
            }
          />
        </Route>
      </Routes>
    </>
  )
}

export default App
