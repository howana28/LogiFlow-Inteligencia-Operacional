import {
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '../context/UsersContext'
import './RbacDemo.css'

interface RequirePermissionProps {
  permission: string
  children: ReactNode
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const navigate = useNavigate()
  const {
    currentUser,
    hasPermission,
  } = useUsers()

  if (hasPermission(permission)) {
    return <>{children}</>
  }

  return (
    <section className="access-denied-page">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <ShieldAlert size={24} />
        </div>

        <span className="page-eyebrow">
          ACESSO RESTRITO
        </span>

        <h1>
          Permissão insuficiente
        </h1>

        <p>
          O perfil{' '}
          <strong>
            {currentUser.role}
          </strong>{' '}
          de {currentUser.name} não possui
          permissão para acessar esta
          funcionalidade.
        </p>

        <div className="access-denied-permission">
          <LockKeyhole size={14} />
          <span>
            Regra necessária:
          </span>
          <strong>
            {permission}
          </strong>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/estoque/dashboard',
            )
          }
        >
          Voltar ao dashboard
        </button>
      </div>
    </section>
  )
}
