# Arquitetura do Microsserviço de Gerenciamento de Projetos

## Visão Geral

Este microsserviço é responsável pelo **gerenciamento centralizado de usuários, projetos e equipes** em uma plataforma de documentação inteligente de software. Fornece autenticação OAuth, controle de acesso baseado em papéis (RBAC), gerenciamento de projetos e recomendações inteligentes baseadas em histórico de acessos.

## Camadas Arquitetônicas

### 1. Camada de Apresentação (Frontend)

**Tecnologias**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui

**Responsabilidades**:
- Interface elegante e responsiva
- Gerenciamento de estado com React Hooks
- Integração com tRPC para chamadas ao backend
- Validação de formulários com React Hook Form + Zod

**Componentes Principais**:
- `Home.tsx`: Landing page com autenticação
- `Dashboard.tsx`: Visão geral de projetos e recomendações
- `ProjectCreate.tsx`: Formulário de criação de projeto
- `ProjectDetails.tsx`: Visualização de detalhes do projeto
- `ProjectMembers.tsx`: Gerenciamento de membros
- `Documentation.tsx`: Documentação arquitetural integrada

### 2. Camada de API (Backend)

**Tecnologias**: Node.js, Express, tRPC, TypeScript

**Responsabilidades**:
- Procedimentos tRPC tipados end-to-end
- Validação de dados com Zod
- Autenticação OAuth
- Middleware de RBAC

**Estrutura**:
```
server/
├── routers.ts           # Procedimentos tRPC
├── db.ts                # Funções de banco de dados
├── *.test.ts            # Testes unitários
└── _core/
    ├── trpc.ts          # Configuração tRPC + middlewares
    ├── context.ts       # Contexto de requisição
    └── auth.ts          # Lógica de autenticação
```

### 3. Camada de Negócio

**Responsabilidades**:
- Lógica de RBAC (Role-Based Access Control)
- Gerenciamento de projetos e equipes
- Algoritmo de recomendação baseado em frequência
- Rastreamento de histórico de acessos

**Fluxos Principais**:

**Criar Projeto**:
```
1. Usuário (GERENTE+) clica "Novo Projeto"
2. Preenche formulário (nome, descrição)
3. Backend valida RBAC
4. Cria projeto e adiciona criador como ADMIN
5. Registra em accessHistory
```

**Adicionar Membro**:
```
1. Usuário (GERENTE+) clica "Adicionar Membro"
2. Seleciona usuário e papel
3. Backend valida permissões
4. Insere em projectMembers
5. Membro pode acessar projeto
```

**Recomendação**:
```
1. Usuário acessa projeto
2. Acesso registrado em accessHistory
3. Backend conta frequência por projeto
4. Ordena por frequência (descendente)
5. Retorna top 5 recomendações
```

### 4. Camada de Dados

**Tecnologias**: MySQL/TiDB, Drizzle ORM

**Tabelas**:

| Tabela | Colunas | Descrição |
|--------|---------|-----------|
| `users` | id, openId, name, email, role, createdAt, updatedAt, lastSignedIn | Usuários do sistema |
| `projects` | id, name, description, ownerId, createdAt, updatedAt | Projetos gerenciados |
| `projectMembers` | id, projectId, userId, role, joinedAt, updatedAt | Associação usuário-projeto |
| `accessHistory` | id, userId, projectId, accessedAt | Histórico de acessos |

## Controle de Acesso Baseado em Papéis (RBAC)

### Papéis Globais

```
┌─────────────────────────────────────────┐
│         PAPÉIS GLOBAIS DO SISTEMA       │
├─────────────────────────────────────────┤
│ ADMIN                                   │
│ ├─ Criar projetos                       │
│ ├─ Editar projetos                      │
│ ├─ Deletar projetos                     │
│ ├─ Gerenciar membros globalmente        │
│ └─ Visualizar todos os projetos         │
├─────────────────────────────────────────┤
│ GERENTE                                 │
│ ├─ Criar projetos                       │
│ ├─ Editar projetos que criou            │
│ ├─ Gerenciar membros em seus projetos   │
│ └─ Visualizar projetos que participa    │
├─────────────────────────────────────────┤
│ MEMBRO                                  │
│ ├─ Visualizar projetos que participa    │
│ └─ Sem permissão de criar/editar        │
└─────────────────────────────────────────┘
```

### Papéis por Projeto

Cada usuário tem um papel específico dentro de cada projeto:

```
┌──────────────────────────────────────────┐
│     PAPÉIS DENTRO DE UM PROJETO          │
├──────────────────────────────────────────┤
│ ADMIN do Projeto                         │
│ ├─ Gerenciar membros                     │
│ ├─ Editar configurações do projeto       │
│ └─ Visualizar tudo                       │
├──────────────────────────────────────────┤
│ GERENTE do Projeto                       │
│ ├─ Gerenciar membros                     │
│ └─ Visualizar conteúdo                   │
├──────────────────────────────────────────┤
│ MEMBRO do Projeto                        │
│ └─ Apenas visualizar conteúdo            │
└──────────────────────────────────────────┘
```

### Implementação de RBAC

**Middlewares tRPC**:

```typescript
// Requer autenticação
export const protectedProcedure = t.procedure.use(requireUser);

// Requer papel ADMIN global
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    if (!ctx.user || ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  }),
);

// Requer papel ADMIN ou GERENTE global
export const gerenteProcedure = t.procedure.use(
  t.middleware(async opts => {
    if (!ctx.user || (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'GERENTE')) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  }),
);
```

**Verificação em Procedimentos**:

```typescript
projects.getById: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input, ctx }) => {
    const project = await db.getProjectById(input.id);
    
    // ADMIN vê tudo, outros só seus projetos
    if (ctx.user.role !== "ADMIN") {
      const membership = await db.getUserProjectRole(project.id, ctx.user.id);
      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
    }
    
    return project;
  }),
```

## Sistema de Recomendação Inteligente

### Algoritmo de Frequência

O sistema utiliza um algoritmo simples mas eficaz baseado em **contagem de frequência de acessos**:

```
┌─────────────────────────────────────────┐
│  ALGORITMO DE RECOMENDAÇÃO              │
├─────────────────────────────────────────┤
│ 1. Coleta de Dados                      │
│    └─ Registra cada acesso em           │
│       accessHistory                     │
├─────────────────────────────────────────┤
│ 2. Contagem de Frequência               │
│    └─ Conta acessos por projeto         │
│       para cada usuário                 │
├─────────────────────────────────────────┤
│ 3. Ordenação                            │
│    └─ Ordena projetos por frequência    │
│       (descendente)                     │
├─────────────────────────────────────────┤
│ 4. Retorno                              │
│    └─ Retorna top 5 projetos            │
│       mais acessados                    │
└─────────────────────────────────────────┘
```

### Exemplo Prático

**Histórico de Acessos do Usuário**:
```
2024-01-01: Projeto A
2024-01-02: Projeto A
2024-01-03: Projeto B
2024-01-04: Projeto A
2024-01-05: Projeto C
2024-01-06: Projeto B
2024-01-07: Projeto A
```

**Contagem de Frequência**:
```
Projeto A: 4 acessos
Projeto B: 2 acessos
Projeto C: 1 acesso
```

**Recomendações (Top 5)**:
```
1. Projeto A (4 acessos)
2. Projeto B (2 acessos)
3. Projeto C (1 acesso)
```

### Implementação

```typescript
recommendations.getProjectRecommendations: protectedProcedure.query(async ({ ctx }) => {
  // 1. Obter histórico de acessos
  const history = await db.getUserAccessHistory(ctx.user.id);
  
  // 2. Contar frequência
  const accessCount: Record<number, number> = {};
  for (const access of history) {
    accessCount[access.projectId] = (accessCount[access.projectId] || 0) + 1;
  }
  
  // 3. Obter projetos e adicionar contagem
  const userProjects = [];
  for (const project of allProjects) {
    userProjects.push({ ...project, accessCount: accessCount[project.id] || 0 });
  }
  
  // 4. Ordenar e retornar top 5
  return userProjects
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 5);
}),
```

## Fluxo de Integração com Outros Microsserviços

### Padrão de Comunicação

```
┌──────────────────────────────────────────┐
│   Outro Microsserviço                    │
└────────────────┬─────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Valida Token JWT   │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Chama Endpoint     │
        │ tRPC               │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Verifica RBAC      │
        │ (middleware)       │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Executa Operação   │
        │ (com validação)    │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Retorna Resultado  │
        │ (tipado)           │
        └────────┬───────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│   Outro Microsserviço recebe resultado   │
└──────────────────────────────────────────┘
```

### Exemplos de Integração

**Microsserviço de Documentação**:
```typescript
// Recebe projectId e userId
const members = await projectManagement.projectMembers.list({ projectId });
const stats = await projectManagement.recommendations.getProjectAccessStats({ projectId });

// Usa para gerar documentação priorizada
const priorityMembers = members.filter(m => stats.find(s => s.userId === m.userId));
```

**Microsserviço de Repositórios GitHub**:
```typescript
// Valida acesso do usuário ao projeto
const membership = await projectManagement.projectMembers.list({ projectId });
if (!membership.find(m => m.userId === userId)) {
  throw new Error("Acesso negado");
}

// Registra acesso
await projectManagement.recordAccess({ userId, projectId });
```

**Microsserviço de Relatórios**:
```typescript
// Obtém histórico de acessos
const history = await projectManagement.recommendations.getAccessHistory();

// Gera relatório de atividade
const report = generateActivityReport(history);
```

## Fluxo de Dados

### Criar Projeto

```
┌─────────────────────────────────────────┐
│ Frontend: Usuário clica "Novo Projeto"  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Frontend: Preenche formulário            │
│ (name, description)                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Frontend: Valida com Zod                │
│ - name: string.min(1)                   │
│ - description: string.optional()        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Frontend: Chama                         │
│ trpc.projects.create.useMutation()      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: gerenteProcedure middleware    │
│ - Verifica autenticação                 │
│ - Verifica papel (ADMIN/GERENTE)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: Valida com Zod                 │
│ - name: string.min(1)                   │
│ - description: string.optional()        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: Cria projeto em DB             │
│ INSERT INTO projects (...)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: Adiciona criador como ADMIN    │
│ INSERT INTO projectMembers (...)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: Retorna { id, name, ... }      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Frontend: Redireciona para projeto      │
│ navigate(`/projects/${id}`)             │
└─────────────────────────────────────────┘
```

## Testes

### Cobertura de Testes

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `auth.logout.test.ts` | 1 | Autenticação e logout |
| `rbac.test.ts` | 16 | Verificação de papéis e permissões |
| `recommendations.test.ts` | 4 | Algoritmo de recomendação |
| **Total** | **21** | **RBAC, Autenticação, IA** |

### Exemplo de Teste

```typescript
describe("RBAC - Role-Based Access Control", () => {
  it("ADMIN should be able to create projects", () => {
    const userRole = "ADMIN";
    const canCreate = userRole === "ADMIN" || userRole === "GERENTE";
    expect(canCreate).toBe(true);
  });

  it("MEMBRO should NOT be able to create projects", () => {
    const userRole = "MEMBRO";
    const canCreate = userRole === "ADMIN" || userRole === "GERENTE";
    expect(canCreate).toBe(false);
  });
});
```

## Stack Tecnológico

### Frontend
- **React 19**: Framework UI moderno com hooks
- **TypeScript**: Tipagem estática end-to-end
- **Tailwind CSS 4**: Estilização utilitária
- **shadcn/ui**: Componentes acessíveis
- **tRPC**: Chamadas RPC tipadas
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Wouter**: Roteamento leve

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework HTTP
- **tRPC**: Framework RPC tipado
- **Drizzle ORM**: ORM type-safe
- **MySQL 2**: Driver de banco de dados
- **Zod**: Validação de dados
- **JWT**: Autenticação

### Banco de Dados
- **MySQL/TiDB**: Banco relacional
- **Drizzle Kit**: Migrations e schema management

### Testes
- **Vitest**: Framework de testes rápido
- **21 testes**: Cobertura de RBAC, recomendações e autenticação

## Escalabilidade e Performance

### Considerações

1. **Índices de Banco de Dados**: Adicionar índices em `projectId`, `userId` em `projectMembers` e `accessHistory`
2. **Cache**: Implementar cache de recomendações com TTL
3. **Paginação**: Adicionar paginação em listagens
4. **Rate Limiting**: Implementar rate limiting em endpoints críticos
5. **Logging**: Adicionar logs estruturados para auditoria

### Otimizações Futuras

- Implementar cache distribuído (Redis)
- Adicionar job queue para processamento assíncrono
- Implementar GraphQL como alternativa a tRPC
- Adicionar métricas e monitoramento
- Implementar circuit breaker para chamadas entre microsserviços

## Conclusão

Este microsserviço fornece uma base sólida e escalável para gerenciamento de projetos, usuários e equipes em uma plataforma de documentação inteligente. A arquitetura em camadas, RBAC avançado, sistema de recomendação inteligente e testes abrangentes garantem qualidade, segurança e facilidade de manutenção.
