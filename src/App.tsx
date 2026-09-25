import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ModulePage } from './pages/ModulePage'
import {
  administrationNavigation,
  modules,
} from './config/navigation'

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

        {modules.flatMap((module) =>
          module.items.map((item) => (
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