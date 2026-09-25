import {
  ChevronDown,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useUsers } from '../context/UsersContext'
import './RbacDemo.css'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function DemoSessionSwitcher() {
  const {
    users,
    currentUser,
    setCurrentUser,
  } = useUsers()

  const [open, setOpen] =
    useState(false)

  const activeUsers = users.filter(
    (user) =>
      user.status === 'ATIVO',
  )

  return (
    <div className="demo-session-switcher">
      <button
        type="button"
        className="demo-session-trigger"
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span className="demo-session-avatar">
          {initials(
            currentUser.name,
          )}
        </span>

        <span className="demo-session-copy">
          <small>
            SESSÃO DEMO
          </small>

          <strong>
            {currentUser.name}
          </strong>

          <span>
            {currentUser.role}
          </span>
        </span>

        <ChevronDown
          size={14}
          className={
            open ? 'open' : ''
          }
        />
      </button>

      {open && (
        <div className="demo-session-menu">
          <div className="demo-session-menu-heading">
            <UserRoundCheck
              size={15}
            />

            <div>
              <strong>
                Trocar perfil
              </strong>

              <span>
                Demonstre o RBAC do
                sistema
              </span>
            </div>
          </div>

          <div className="demo-session-options">
            {activeUsers.map(
              (user) => (
                <button
                  key={user.id}
                  type="button"
                  className={
                    user.id ===
                    currentUser.id
                      ? 'active'
                      : ''
                  }
                  onClick={() => {
                    setCurrentUser(
                      user.id,
                    )
                    setOpen(false)
                  }}
                >
                  <span className="demo-session-option-avatar">
                    {initials(
                      user.name,
                    )}
                  </span>

                  <span>
                    <strong>
                      {user.name}
                    </strong>

                    <small>
                      {user.role}
                    </small>
                  </span>

                  {user.id ===
                    currentUser.id && (
                    <ShieldCheck
                      size={14}
                    />
                  )}
                </button>
              ),
            )}
          </div>

          <div className="demo-session-hint">
            Perfis alteram o acesso às
            rotas e às ações protegidas.
          </div>
        </div>
      )}
    </div>
  )
}
