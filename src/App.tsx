import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import {
  administrationNavigation,
  modules,
} from './config/navigation'
import { AppLayout } from './layouts/AppLayout'
import { ConferenciaDevolucoes } from './pages/ConferenciaDevolucoes'
import { DashboardDevolucoes } from './pages/DashboardDevolucoes'
import { DashboardEstoque } from './pages/DashboardEstoque'
import { DevolucoesLista } from './pages/DevolucoesLista'
import { EntradaEstoque } from './pages/EntradaEstoque'
import { MapaEstoque } from './pages/MapaEstoque'
import { ModulePage } from './pages/ModulePage'
import { MovimentacoesEstoque } from './pages/MovimentacoesEstoque'
import { NovaDevolucao } from './pages/NovaDevolucao'
import { PosicoesAtuais } from './pages/PosicoesAtuais'
import { RetiradaEstoque } from './pages/RetiradaEstoque'

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

function App() {
  return (
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
          element={<DashboardEstoque />}
        />

        <Route
          path="/estoque/entrada"
          element={<EntradaEstoque />}
        />

        <Route
          path="/estoque/retirada"
          element={<RetiradaEstoque />}
        />

        <Route
          path="/estoque/movimentacoes"
          element={<MovimentacoesEstoque />}
        />

        <Route
          path="/estoque/mapa"
          element={<MapaEstoque />}
        />

        <Route
          path="/estoque/posicoes"
          element={<PosicoesAtuais />}
        />

        <Route
          path="/devolucoes/dashboard"
          element={<DashboardDevolucoes />}
        />

        <Route
          path="/devolucoes/nova"
          element={<NovaDevolucao />}
        />

        <Route
          path="/devolucoes/revisar"
          element={
            <DevolucoesLista
              mode="review"
            />
          }
        />

        <Route
          path="/devolucoes/conferencia"
          element={
            <ConferenciaDevolucoes />
          }
        />

        <Route
          path="/devolucoes/ultimos"
          element={
            <DevolucoesLista
              mode="recent"
            />
          }
        />

        <Route
          path="/devolucoes/todas"
          element={
            <DevolucoesLista
              mode="all"
            />
          }
        />

        {modules.flatMap((module) =>
          module.items
            .filter(
              (item) =>
                ![
                  ...functionalInventoryRoutes,
                  ...functionalReturnsRoutes,
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
            <ModulePage
              eyebrow={administrationNavigation.eyebrow}
              title={administrationNavigation.title}
              description={administrationNavigation.description}
            />
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
  )
}

export default App
