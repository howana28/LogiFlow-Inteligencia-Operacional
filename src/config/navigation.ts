import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Map,
  PackageCheck,
  PackagePlus,
  Repeat2,
  ScanLine,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

export type ModuleKey = 'estoque' | 'devolucoes' | 'recebimento'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
}

export interface ModuleNavigation {
  key: ModuleKey
  label: string
  icon: LucideIcon
  items: NavigationItem[]
}

export const modules: ModuleNavigation[] = [
  {
    key: 'estoque',
    label: 'Estoque',
    icon: Warehouse,
    items: [
      {
        label: 'Dashboard',
        path: '/estoque/dashboard',
        icon: LayoutDashboard,
        eyebrow: 'ESTOQUE',
        title: 'Dashboard de estoque',
        description:
          'Acompanhe níveis de estoque, ocupação, produtos e movimentações recentes.',
      },
      {
        label: 'Entrada de estoque',
        path: '/estoque/entrada',
        icon: ArrowDownToLine,
        eyebrow: 'ESTOQUE',
        title: 'Entrada de estoque',
        description:
          'Registre novas entradas de produtos e direcione cada item para sua posição.',
      },
      {
        label: 'Retirada',
        path: '/estoque/retirada',
        icon: ArrowUpFromLine,
        eyebrow: 'ESTOQUE',
        title: 'Retirada de estoque',
        description:
          'Registre retiradas de produtos com rastreabilidade de quantidade e responsável.',
      },
      {
        label: 'Movimentações',
        path: '/estoque/movimentacoes',
        icon: Repeat2,
        eyebrow: 'RASTREABILIDADE',
        title: 'Movimentações',
        description:
          'Acompanhe entradas, saídas e transferências realizadas no estoque.',
      },
      {
        label: 'Mapa de estoque',
        path: '/estoque/mapa',
        icon: Map,
        eyebrow: 'ARMAZENAGEM',
        title: 'Mapa de estoque',
        description:
          'Visualize a distribuição física dos produtos por área, corredor e posição.',
      },
      {
        label: 'Posições atuais',
        path: '/estoque/posicoes',
        icon: Boxes,
        eyebrow: 'INVENTÁRIO',
        title: 'Posições atuais',
        description:
          'Consulte produtos, quantidades disponíveis e posições ocupadas.',
      },
    ],
  },
  {
    key: 'devolucoes',
    label: 'Devoluções',
    icon: ClipboardCheck,
    items: [
      {
        label: 'Dashboard',
        path: '/devolucoes/dashboard',
        icon: LayoutDashboard,
        eyebrow: 'LOGÍSTICA REVERSA',
        title: 'Dashboard de devoluções',
        description:
          'Acompanhe volumes, status, causas e indicadores do processo de devolução.',
      },
      {
        label: 'Nova devolução',
        path: '/devolucoes/nova',
        icon: FilePlus2,
        eyebrow: 'LOGÍSTICA REVERSA',
        title: 'Nova devolução',
        description:
          'Registre uma nova ocorrência e os produtos vinculados à devolução.',
      },
      {
        label: 'A revisar',
        path: '/devolucoes/revisar',
        icon: Clock3,
        eyebrow: 'ANÁLISE',
        title: 'Devoluções a revisar',
        description:
          'Analise ocorrências pendentes antes de encaminhá-las para conferência.',
      },
      {
        label: 'Conferência de estoque',
        path: '/devolucoes/conferencia',
        icon: ScanLine,
        eyebrow: 'CONFERÊNCIA',
        title: 'Conferência de estoque',
        description:
          'Valide o estado dos produtos e determine o destino de cada devolução.',
      },
      {
        label: 'Últimos lançamentos',
        path: '/devolucoes/ultimos',
        icon: Clock3,
        eyebrow: 'HISTÓRICO',
        title: 'Últimos lançamentos',
        description:
          'Consulte rapidamente as devoluções registradas mais recentemente.',
      },
      {
        label: 'Todas devoluções',
        path: '/devolucoes/todas',
        icon: ListChecks,
        eyebrow: 'REGISTROS',
        title: 'Todas devoluções',
        description:
          'Pesquise e filtre o histórico completo de devoluções da operação.',
      },
    ],
  },
  {
    key: 'recebimento',
    label: 'Recebimento',
    icon: PackageCheck,
    items: [
      {
        label: 'Dashboard',
        path: '/recebimento/dashboard',
        icon: LayoutDashboard,
        eyebrow: 'RECEBIMENTO',
        title: 'Dashboard de recebimento',
        description:
          'Acompanhe compras previstas, recebimentos e desempenho da conferência.',
      },
      {
        label: 'Lançar compra',
        path: '/recebimento/lancar',
        icon: PackagePlus,
        eyebrow: 'COMPRAS',
        title: 'Lançar compra',
        description:
          'Cadastre novas compras e informações necessárias para o recebimento.',
      },
      {
        label: 'A caminho',
        path: '/recebimento/caminho',
        icon: Clock3,
        eyebrow: 'ACOMPANHAMENTO',
        title: 'Compras a caminho',
        description:
          'Acompanhe fornecedores, previsões de chegada e pedidos ainda em trânsito.',
      },
      {
        label: 'Conferência',
        path: '/recebimento/conferencia',
        icon: ScanLine,
        eyebrow: 'CONFERÊNCIA',
        title: 'Conferência de recebimento',
        description:
          'Registre volumes, itens recebidos e eventuais divergências da compra.',
      },
      {
        label: 'Recebimentos processados',
        path: '/recebimento/processados',
        icon: ListChecks,
        eyebrow: 'HISTÓRICO',
        title: 'Recebimentos processados',
        description:
          'Consulte o histórico de compras finalizadas e conferências concluídas.',
      },
    ],
  },
]

export const administrationNavigation = {
  label: 'Usuários',
  path: '/usuarios',
  icon: Users,
  eyebrow: 'ADMINISTRAÇÃO',
  title: 'Usuários e permissões',
  description:
    'Gerencie usuários, cargos, status e permissões de acesso aos módulos do sistema.',
}