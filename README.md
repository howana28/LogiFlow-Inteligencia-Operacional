# LogiFlow — Inteligência Operacional

Sistema logístico demonstrativo desenvolvido como projeto de portfólio Full Stack, com foco em operações de estoque, logística reversa, recebimento de cargas e administração de usuários.

> Todos os dados exibidos no projeto são fictícios e foram criados exclusivamente para demonstração.

## Visão geral

O LogiFlow simula uma operação logística integrada em uma interface web moderna e responsiva. O projeto foi construído de forma incremental, com módulos funcionais compartilhando estado e atualizando indicadores em tempo real.

### Módulos

#### Estoque
- Dashboard operacional
- Entrada de estoque
- Retirada de estoque
- Transferência entre posições
- Histórico de movimentações
- Mapa interativo do armazém
- Consulta de posições atuais
- Detalhes por SKU
- Alertas de estoque mínimo

#### Devoluções
- Dashboard de logística reversa
- Registro de nova devolução
- Fila de revisão
- Conferência física
- Reintegração ao estoque
- Finalização sem reintegração
- Histórico de devoluções
- Atualização automática do estoque após reintegração

#### Recebimento
- Dashboard de recebimento
- Lançamento de ordem de compra
- Cargas a caminho
- Conferência previsto x recebido
- Registro de divergências
- Endereçamento de itens
- Recebimentos processados
- Entrada automática no estoque

#### Administração
- Gestão de usuários
- Papéis e cargos
- Status ativo/inativo
- Matriz de permissões por perfil
- Busca e filtros

## Stack

- React
- TypeScript
- Vite
- React Router
- Lucide React
- Context API
- LocalStorage

## Arquitetura

A aplicação foi organizada por responsabilidade:

```text
src/
├── components/
├── config/
├── context/
├── data/
├── layouts/
├── pages/
├── types/
├── App.tsx
└── main.tsx
```

Os módulos compartilham dados através de Context API.

Exemplos de integração:

```text
Devoluções
→ Conferência
→ Reintegração
→ Estoque
→ Movimentações
→ Dashboard

Recebimento
→ Conferência
→ Endereçamento
→ Estoque
→ Movimentações
→ Dashboard
```

## Dados de demonstração

O projeto utiliza dados fictícios de produtos, usuários, devoluções e recebimentos.

Categorias utilizadas:
- Eletrônicos
- Acessórios
- Vestuário
- Escritório

Os dados alterados durante a navegação são persistidos localmente através de `localStorage`, permitindo demonstrar o fluxo da aplicação sem necessidade de infraestrutura externa.

## Como executar

### Requisitos

- Node.js
- npm

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

## Principais decisões técnicas

- Estado de domínio separado por contexto.
- Tipagem centralizada para entidades logísticas.
- Dados de demonstração isolados da interface.
- Rotas organizadas por módulo.
- Persistência local para manter o comportamento entre recarregamentos.
- Componentes e páginas separados por responsabilidade.
- Fluxos integrados entre módulos em vez de telas independentes.

## Evolução do projeto

O histórico de commits registra a construção incremental do sistema, incluindo:

1. estrutura inicial React + TypeScript;
2. navegação modular;
3. dados tipados;
4. mapa interativo;
5. posições e detalhes de produto;
6. entradas e retiradas;
7. movimentações;
8. transferências;
9. dashboard de estoque;
10. devoluções;
11. integração devoluções x estoque;
12. recebimento;
13. usuários, cargos e permissões.

## Objetivo

Este projeto foi desenvolvido para demonstrar competências em:

- desenvolvimento frontend com React e TypeScript;
- modelagem de processos operacionais;
- gerenciamento de estado;
- integração entre módulos;
- construção de dashboards;
- UX para sistemas internos;
- tipagem e organização de código;
- evolução incremental de produto.

## Status

Versão demonstrativa funcional para portfólio.

Próximas evoluções planejadas:
- RBAC aplicado às rotas e ações;
- autenticação;
- backend persistente;
- testes automatizados;
- integração com API;
- deploy público.

---

Desenvolvido como projeto de portfólio.
