import {
  Check,
  LockKeyhole,
  Mail,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  rolePermissions,
  useUsers,
} from '../context/UsersContext'
import type {
  SystemUser,
  UserRole,
  UserStatus,
} from '../types/logistics'
import './Usuarios.css'

const roles: UserRole[] = [
  'Administrador',
  'Analista',
  'Operador de Estoque',
  'Conferente',
]

const permissionGroups = [
  {
    title: 'Estoque',
    permissions: [
      {
        id: 'inventory.view',
        label: 'Visualizar estoque',
      },
      {
        id: 'inventory.entry',
        label: 'Registrar entradas',
      },
      {
        id: 'inventory.withdrawal',
        label: 'Registrar retiradas',
      },
      {
        id: 'inventory.transfer',
        label: 'Transferir posições',
      },
    ],
  },
  {
    title: 'Devoluções',
    permissions: [
      {
        id: 'returns.view',
        label: 'Visualizar devoluções',
      },
      {
        id: 'returns.manage',
        label: 'Gerenciar devoluções',
      },
      {
        id: 'returns.conference',
        label: 'Conferir devoluções',
      },
    ],
  },
  {
    title: 'Recebimento',
    permissions: [
      {
        id: 'receiving.view',
        label: 'Visualizar recebimentos',
      },
      {
        id: 'receiving.manage',
        label: 'Gerenciar recebimentos',
      },
      {
        id: 'receiving.conference',
        label: 'Conferir recebimentos',
      },
    ],
  },
  {
    title: 'Administração',
    permissions: [
      {
        id: 'users.view',
        label: 'Visualizar usuários',
      },
      {
        id: 'users.manage',
        label: 'Gerenciar usuários',
      },
    ],
  },
]

type DrawerMode =
  | 'create'
  | 'edit'

interface UserFormState {
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'Operador de Estoque',
  status: 'ATIVO',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function Usuarios() {
  const {
    users,
    createUser,
    updateUser,
    toggleUserStatus,
  } = useUsers()

  const [search, setSearch] =
    useState('')

  const [roleFilter, setRoleFilter] =
    useState<'TODOS' | UserRole>(
      'TODOS',
    )

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<'TODOS' | UserStatus>(
    'TODOS',
  )

  const [drawerMode, setDrawerMode] =
    useState<DrawerMode | null>(null)

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<SystemUser | null>(null)

  const [form, setForm] =
    useState<UserFormState>(
      emptyForm,
    )

  const [message, setMessage] =
    useState<{
      type: 'success' | 'error'
      text: string
    } | null>(null)

  const filteredUsers = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name
          .toLowerCase()
          .includes(term) ||
        user.email
          .toLowerCase()
          .includes(term) ||
        user.role
          .toLowerCase()
          .includes(term)

      const matchesRole =
        roleFilter === 'TODOS' ||
        user.role === roleFilter

      const matchesStatus =
        statusFilter === 'TODOS' ||
        user.status === statusFilter

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      )
    })
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ])

  const metrics = useMemo(
    () => ({
      total: users.length,
      active: users.filter(
        (user) =>
          user.status === 'ATIVO',
      ).length,
      inactive: users.filter(
        (user) =>
          user.status ===
          'INATIVO',
      ).length,
      admins: users.filter(
        (user) =>
          user.role ===
          'Administrador',
      ).length,
    }),
    [users],
  )

  const currentPermissions =
    rolePermissions[form.role]

  function openCreate() {
    setDrawerMode('create')
    setSelectedUser(null)
    setForm(emptyForm)
    setMessage(null)
  }

  function openEdit(
    user: SystemUser,
  ) {
    setDrawerMode('edit')
    setSelectedUser(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setMessage(null)
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedUser(null)
    setMessage(null)
  }

  function updateField<
    K extends keyof UserFormState,
  >(
    key: K,
    value: UserFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))

    setMessage(null)
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    try {
      if (
        drawerMode === 'edit' &&
        selectedUser
      ) {
        updateUser(
          selectedUser.id,
          form,
        )

        setMessage({
          type: 'success',
          text: 'Usuário atualizado com sucesso.',
        })

        return
      }

      const created =
        createUser(form)

      setSelectedUser(created)

      setMessage({
        type: 'success',
        text: 'Usuário criado com sucesso.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o usuário.',
      })
    }
  }

  return (
    <section className="users-page">
      <div className="users-heading">
        <div>
          <span className="page-eyebrow">
            ADMINISTRAÇÃO
          </span>

          <h1>Usuários</h1>

          <p className="page-description">
            Gerencie acessos, papéis e
            permissões operacionais do
            sistema.
          </p>
        </div>

        <button
          type="button"
          className="users-primary-button"
          onClick={openCreate}
        >
          <UserPlus size={15} />
          Novo usuário
        </button>
      </div>

      <div className="users-kpis">
        <article>
          <div className="users-kpi-icon">
            <Users size={18} />
          </div>

          <span>
            Usuários
          </span>

          <strong>
            {metrics.total}
          </strong>

          <small>
            cadastros no ambiente
          </small>
        </article>

        <article>
          <div className="users-kpi-icon success">
            <UserCheck
              size={18}
            />
          </div>

          <span>Ativos</span>

          <strong>
            {metrics.active}
          </strong>

          <small>
            com acesso liberado
          </small>
        </article>

        <article>
          <div className="users-kpi-icon muted">
            <UserX size={18} />
          </div>

          <span>Inativos</span>

          <strong>
            {metrics.inactive}
          </strong>

          <small>
            acessos bloqueados
          </small>
        </article>

        <article>
          <div className="users-kpi-icon admin">
            <ShieldCheck
              size={18}
            />
          </div>

          <span>
            Administradores
          </span>

          <strong>
            {metrics.admins}
          </strong>

          <small>
            acesso total ao sistema
          </small>
        </article>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar nome, e-mail ou cargo"
          />
        </div>

        <div className="users-filters">
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as
                  | 'TODOS'
                  | UserRole,
              )
            }
          >
            <option value="TODOS">
              Todos os cargos
            </option>

            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'TODOS'
                  | UserStatus,
              )
            }
          >
            <option value="TODOS">
              Todos os status
            </option>

            <option value="ATIVO">
              Ativos
            </option>

            <option value="INATIVO">
              Inativos
            </option>
          </select>
        </div>
      </div>

      <div className="users-table-card">
        <div className="users-table-header">
          <div>
            <strong>
              Gestão de acessos
            </strong>

            <span>
              {filteredUsers.length}{' '}
              usuários encontrados
            </span>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Permissões</th>
                <th>Acesso</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(
                (user) => (
                  <tr
                    key={user.id}
                    onClick={() =>
                      openEdit(user)
                    }
                  >
                    <td>
                      <div className="user-identity">
                        <div className="user-avatar">
                          {initials(
                            user.name,
                          )}
                        </div>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <span>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="user-role">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`user-status ${
                          user.status ===
                          'ATIVO'
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {user.status ===
                        'ATIVO'
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <strong className="user-permission-count">
                        {
                          user.permissions
                            .length
                        }
                      </strong>{' '}
                      <span className="user-permission-label">
                        regras
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`user-access-button ${
                          user.status ===
                          'ATIVO'
                            ? 'deactivate'
                            : 'activate'
                        }`}
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation()
                          toggleUserStatus(
                            user.id,
                          )
                        }}
                      >
                        {user.status ===
                        'ATIVO'
                          ? 'Desativar'
                          : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawerMode && (
        <div
          className="users-drawer-backdrop"
          onMouseDown={closeDrawer}
        >
          <aside
            className="users-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="users-drawer-close"
              onClick={closeDrawer}
              aria-label="Fechar usuário"
            >
              <X size={19} />
            </button>

            <div className="users-drawer-heading">
              <div className="users-drawer-icon">
                {drawerMode ===
                'create' ? (
                  <UserPlus
                    size={20}
                  />
                ) : (
                  <ShieldCheck
                    size={20}
                  />
                )}
              </div>

              <span>
                {drawerMode ===
                'create'
                  ? 'NOVO ACESSO'
                  : 'GESTÃO DE ACESSO'}
              </span>

              <h2>
                {drawerMode ===
                'create'
                  ? 'Novo usuário'
                  : form.name}
              </h2>

              <p>
                {drawerMode ===
                'create'
                  ? 'Cadastre o usuário e defina o papel que determinará suas permissões.'
                  : 'Edite os dados, o status e o papel atribuído ao usuário.'}
              </p>
            </div>

            <form
              className="users-form"
              onSubmit={handleSubmit}
            >
              <div className="users-field">
                <label>Nome</label>

                <input
                  value={form.name}
                  disabled={
                    message?.type ===
                    'success'
                  }
                  onChange={(event) =>
                    updateField(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="Nome completo"
                />
              </div>

              <div className="users-field">
                <label>E-mail</label>

                <div className="users-input-icon">
                  <Mail size={14} />

                  <input
                    type="email"
                    value={form.email}
                    disabled={
                      message?.type ===
                      'success'
                    }
                    onChange={(event) =>
                      updateField(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="usuario@empresa.com"
                  />
                </div>
              </div>

              <div className="users-form-columns">
                <div className="users-field">
                  <label>Cargo</label>

                  <select
                    value={form.role}
                    disabled={
                      message?.type ===
                      'success'
                    }
                    onChange={(event) =>
                      updateField(
                        'role',
                        event.target
                          .value as UserRole,
                      )
                    }
                  >
                    {roles.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {role}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="users-field">
                  <label>Status</label>

                  <select
                    value={form.status}
                    disabled={
                      message?.type ===
                      'success'
                    }
                    onChange={(event) =>
                      updateField(
                        'status',
                        event.target
                          .value as UserStatus,
                      )
                    }
                  >
                    <option value="ATIVO">
                      Ativo
                    </option>

                    <option value="INATIVO">
                      Inativo
                    </option>
                  </select>
                </div>
              </div>

              <div className="permissions-section">
                <div className="permissions-heading">
                  <div>
                    <strong>
                      Matriz de permissões
                    </strong>

                    <span>
                      Herdadas
                      automaticamente do
                      cargo selecionado.
                    </span>
                  </div>

                  <div className="permissions-lock">
                    <LockKeyhole
                      size={13}
                    />
                    Somente leitura
                  </div>
                </div>

                <div className="permissions-grid">
                  {permissionGroups.map(
                    (group) => (
                      <div
                        key={
                          group.title
                        }
                        className="permission-group"
                      >
                        <strong>
                          {
                            group.title
                          }
                        </strong>

                        <div>
                          {group.permissions.map(
                            (
                              permission,
                            ) => {
                              const allowed =
                                currentPermissions.includes(
                                  permission.id,
                                )

                              return (
                                <div
                                  key={
                                    permission.id
                                  }
                                  className={`permission-row ${
                                    allowed
                                      ? 'allowed'
                                      : 'blocked'
                                  }`}
                                >
                                  <span className="permission-check">
                                    {allowed && (
                                      <Check
                                        size={
                                          11
                                        }
                                      />
                                    )}
                                  </span>

                                  <span>
                                    {
                                      permission.label
                                    }
                                  </span>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {message && (
                <div
                  className={`users-message ${message.type}`}
                >
                  {message.text}
                </div>
              )}

              <div className="users-form-actions">
                {message?.type ===
                'success' ? (
                  <button
                    type="button"
                    className="users-primary-button"
                    onClick={closeDrawer}
                  >
                    Concluir
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="users-secondary-button"
                      onClick={
                        closeDrawer
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="users-primary-button"
                    >
                      <Save size={14} />
                      Salvar usuário
                    </button>
                  </>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}
    </section>
  )
}
