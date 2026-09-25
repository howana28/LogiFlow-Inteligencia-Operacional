import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  users as seedUsers,
} from '../data/mockData'
import type {
  SystemUser,
  UserRole,
  UserStatus,
} from '../types/logistics'

export const rolePermissions: Record<
  UserRole,
  string[]
> = {
  Administrador: [
    'inventory.view',
    'inventory.entry',
    'inventory.withdrawal',
    'inventory.transfer',
    'returns.view',
    'returns.manage',
    'returns.conference',
    'receiving.view',
    'receiving.manage',
    'receiving.conference',
    'users.view',
    'users.manage',
  ],
  Analista: [
    'inventory.view',
    'returns.view',
    'receiving.view',
    'users.view',
  ],
  'Operador de Estoque': [
    'inventory.view',
    'inventory.entry',
    'inventory.withdrawal',
    'inventory.transfer',
    'returns.view',
    'receiving.view',
  ],
  Conferente: [
    'inventory.view',
    'returns.view',
    'returns.conference',
    'receiving.view',
    'receiving.conference',
  ],
}

interface CreateUserInput {
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

interface UpdateUserInput {
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

interface UsersContextValue {
  users: SystemUser[]
  currentUser: SystemUser
  setCurrentUser: (
    id: string,
  ) => void
  hasPermission: (
    permission: string,
  ) => boolean
  createUser: (
    input: CreateUserInput,
  ) => SystemUser
  updateUser: (
    id: string,
    input: UpdateUserInput,
  ) => void
  toggleUserStatus: (
    id: string,
  ) => void
  resetUsersDemo: () => void
}

const USERS_STORAGE_KEY =
  'logiflow-demo-users'

const CURRENT_USER_STORAGE_KEY =
  'logiflow-demo-current-user'

const UsersContext =
  createContext<UsersContextValue | null>(
    null,
  )

function createId() {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return `usr-${crypto.randomUUID()}`
  }

  return `usr-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function normalizeUsers(
  users: SystemUser[],
) {
  return users.map((user) => ({
    ...user,
    permissions:
      rolePermissions[user.role],
  }))
}

function readStorage<T>(
  key: string,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key)

    if (!raw) {
      return fallback
    }

    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const normalizedSeed =
  normalizeUsers(seedUsers)

function defaultUserId(
  users: SystemUser[],
) {
  return (
    users.find(
      (user) =>
        user.role ===
          'Administrador' &&
        user.status === 'ATIVO',
    )?.id ??
    users.find(
      (user) =>
        user.status === 'ATIVO',
    )?.id ??
    users[0]?.id ??
    ''
  )
}

export function UsersProvider({
  children,
}: {
  children: ReactNode
}) {
  const [users, setUsers] =
    useState<SystemUser[]>(() =>
      normalizeUsers(
        readStorage(
          USERS_STORAGE_KEY,
          normalizedSeed,
        ),
      ),
    )

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string>(() =>
    readStorage(
      CURRENT_USER_STORAGE_KEY,
      defaultUserId(normalizedSeed),
    ),
  )

  useEffect(() => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(users),
    )
  }, [users])

  useEffect(() => {
    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(currentUserId),
    )
  }, [currentUserId])

  const currentUser =
    users.find(
      (user) =>
        user.id === currentUserId,
    ) ??
    users.find(
      (user) =>
        user.role ===
          'Administrador' &&
        user.status === 'ATIVO',
    ) ??
    users.find(
      (user) =>
        user.status === 'ATIVO',
    ) ??
    users[0]

  function setCurrentUser(id: string) {
    const user = users.find(
      (item) => item.id === id,
    )

    if (!user) {
      throw new Error(
        'Usuário não encontrado.',
      )
    }

    if (user.status !== 'ATIVO') {
      throw new Error(
        'Usuários inativos não podem iniciar uma sessão demo.',
      )
    }

    setCurrentUserId(user.id)
  }

  function hasPermission(
    permission: string,
  ) {
    return Boolean(
      currentUser &&
        currentUser.status ===
          'ATIVO' &&
        currentUser.permissions.includes(
          permission,
        ),
    )
  }

  function validateEmail(
    email: string,
    ignoreId?: string,
  ) {
    const normalized =
      email.trim().toLowerCase()

    if (!normalized.includes('@')) {
      throw new Error(
        'Informe um e-mail válido.',
      )
    }

    const duplicate = users.find(
      (user) =>
        user.id !== ignoreId &&
        user.email
          .trim()
          .toLowerCase() ===
          normalized,
    )

    if (duplicate) {
      throw new Error(
        'Já existe um usuário com este e-mail.',
      )
    }
  }

  function createUser(
    input: CreateUserInput,
  ) {
    if (!input.name.trim()) {
      throw new Error(
        'Informe o nome do usuário.',
      )
    }

    validateEmail(input.email)

    const user: SystemUser = {
      id: createId(),
      name: input.name.trim(),
      email: input.email
        .trim()
        .toLowerCase(),
      role: input.role,
      status: input.status,
      permissions:
        rolePermissions[input.role],
    }

    setUsers((current) => [
      user,
      ...current,
    ])

    return user
  }

  function updateUser(
    id: string,
    input: UpdateUserInput,
  ) {
    if (!input.name.trim()) {
      throw new Error(
        'Informe o nome do usuário.',
      )
    }

    validateEmail(
      input.email,
      id,
    )

    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              name: input.name.trim(),
              email: input.email
                .trim()
                .toLowerCase(),
              role: input.role,
              status: input.status,
              permissions:
                rolePermissions[
                  input.role
                ],
            }
          : user,
      ),
    )
  }

  function toggleUserStatus(
    id: string,
  ) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status ===
                'ATIVO'
                  ? 'INATIVO'
                  : 'ATIVO',
            }
          : user,
      ),
    )
  }

  function resetUsersDemo() {
    const resetUsers =
      normalizedSeed.map((user) => ({
        ...user,
        permissions: [
          ...user.permissions,
        ],
      }))

    setUsers(resetUsers)
    setCurrentUserId(
      defaultUserId(resetUsers),
    )
  }

  if (!currentUser) {
    throw new Error(
      'Nenhum usuário demo disponível.',
    )
  }

  const value = useMemo(
    () => ({
      users,
      currentUser,
      setCurrentUser,
      hasPermission,
      createUser,
      updateUser,
      toggleUserStatus,
      resetUsersDemo,
    }),
    [
      users,
      currentUser,
      currentUserId,
    ],
  )

  return (
    <UsersContext.Provider
      value={value}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context =
    useContext(UsersContext)

  if (!context) {
    throw new Error(
      'useUsers deve ser utilizado dentro de UsersProvider.',
    )
  }

  return context
}
