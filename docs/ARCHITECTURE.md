# Arquitetura do LogiFlow

## Domínios principais

A aplicação foi dividida em quatro domínios:

- Estoque
- Devoluções
- Recebimento
- Administração

Cada domínio possui páginas próprias e compartilha informações por Context API.

## Contextos

### InventoryContext

Responsável por:
- produtos;
- posições;
- movimentações;
- entrada;
- retirada;
- transferência.

### ReturnsContext

Responsável por:
- registro de devoluções;
- status do fluxo;
- conferência;
- finalização.

Quando uma devolução é reintegrada, o fluxo chama o `InventoryContext` para gerar a entrada correspondente.

### ReceivingContext

Responsável por:
- ordens previstas;
- início de conferência;
- previsto x recebido;
- divergências;
- processamento.

Após a conferência, os itens aprovados são enviados ao `InventoryContext`.

### UsersContext

Responsável por:
- usuários;
- cargos;
- status;
- matriz de permissões.

## Fluxos integrados

```text
DEVOLUÇÃO
Nova ocorrência
    ↓
A revisar
    ↓
Em conferência
    ↓
Reintegrar?
  ↙     ↘
Sim     Não
 ↓       ↓
Estoque  Finalizada
 ↓
Movimentação
 ↓
Dashboard
```

```text
RECEBIMENTO
Ordem de compra
    ↓
A caminho
    ↓
Conferência
    ↓
Previsto x recebido
    ↓
Endereçamento
    ↓
Estoque
    ↓
Movimentação
    ↓
Dashboard
```

## Persistência

A versão de portfólio utiliza `localStorage`.

Isso permite demonstrar:
- criação de registros;
- alterações de status;
- movimentações;
- transferências;
- conferências;
- usuários;

sem depender de backend externo.

## Evolução futura

A arquitetura permite substituir os contextos por serviços de API sem necessidade de redesenhar as páginas.

Uma evolução natural seria:

```text
React
  ↓
REST API
  ↓
Backend
  ↓
PostgreSQL
```

Também estão previstos:
- autenticação;
- RBAC aplicado às ações;
- testes;
- observabilidade;
- deploy público.
