import {
  Boxes,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  administrationNavigation,
  modules,
  type ModuleKey,
} from '../config/navigation'
import './AppLayout.css'

function getCurrentModule(pathname: string): ModuleKey {
  if (pathname.startsWith('/devolucoes')) {
    return 'devolucoes'
  }

  if (pathname.startsWith('/recebimento')) {
    return 'recebimento'
  }

  return 'estoque'
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentModuleKey = getCurrentModule(
    location.pathname,
  )

  const currentModule =
    modules.find(
      (module) =>
        module.key === currentModuleKey,
    ) ?? modules[0]

  function handleModuleChange(
    moduleKey: ModuleKey,
  ) {
    const module = modules.find(
      (item) => item.key === moduleKey,
    )

    if (!module) {
      return
    }

    navigate(module.items[0].path)
  }

  const isUsersPage =
    location.pathname.startsWith('/usuarios')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Boxes
              size={21}
              strokeWidth={1.8}
            />
          </div>

          <div className="brand-copy">
            <strong>LogiFlow</strong>

            <span>
              Operations
              <br />
              Intelligence
            </span>
          </div>
        </div>

        <div className="module-switcher">
          {modules.map((module) => (
            <button
              key={module.key}
              type="button"
              className={
                currentModuleKey ===
                  module.key &&
                !isUsersPage
                  ? 'module-switch active'
                  : 'module-switch'
              }
              onClick={() =>
                handleModuleChange(module.key)
              }
            >
              {module.label}
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">
            {currentModule.label}
          </span>

          <nav className="sidebar-navigation">
            {currentModule.items.map(
              (item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({
                      isActive,
                    }) =>
                      `nav-item ${
                        isActive
                          ? 'active'
                          : ''
                      }`
                    }
                  >
                    <Icon
                      className="nav-icon"
                      size={17}
                      strokeWidth={1.7}
                    />

                    <span className="nav-label">
                      {item.label}
                    </span>
                  </NavLink>
                )
              },
            )}
          </nav>
        </div>

        <div className="sidebar-admin">
          <span className="sidebar-section-label">
            Administração
          </span>

          <NavLink
            to={
              administrationNavigation.path
            }
            className={({ isActive }) =>
              `nav-item admin-nav ${
                isActive ? 'active' : ''
              }`
            }
          >
            <Users
              className="nav-icon"
              size={17}
              strokeWidth={1.7}
            />

            <span className="nav-label">
              Usuários
            </span>
          </NavLink>
        </div>

        <div className="portfolio-note">
          <ShieldCheck size={16} />

          <div>
            <strong>
              Demo para portfólio
            </strong>

            <span>
              Todos os dados exibidos são
              fictícios.
            </span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">
            AM
          </div>

          <div className="user-copy">
            <strong>Ana Mendes</strong>
            <span>
              Full Stack Developer
            </span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            LogiFlow /{' '}
            {currentModule.label}
          </div>

          <div className="demo-badge">
            Demo · Dados fictícios
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}