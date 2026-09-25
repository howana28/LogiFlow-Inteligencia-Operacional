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
import { EntradaEstoque } from './pages/EntradaEstoque'
import { MapaEstoque } from './pages/MapaEstoque'
import { ModulePage } from './pages/ModulePage'
import { MovimentacoesEstoque } from './pages/MovimentacoesEstoque'
import { PosicoesAtuais } from './pages/PosicoesAtuais'
import { RetiradaEstoque } from './pages/RetiradaEstoque'

const functionalInventoryRoutes = [
  '/estoque/entrada',
  '/estoque/retirada',
  '/estoque/movimentacoes',
  '/estoque/mapa',
  '/estoque/posicoes',
]

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={<Navigate to="/estoque/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Navigate to="/estoque/dashboard" replace />}
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

        {modules.flatMap((module) =>
          module.items
            .filter(
              (item) =>
                !functionalInventoryRoutes.includes(
                  item.path,
                ),
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
          element={<Navigate to="/estoque/dashboard" replace />}
        />
      </Route>
    </Routes>
  )
}

export default App
