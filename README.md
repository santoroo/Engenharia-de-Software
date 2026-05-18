# Microsserviço de Gerenciamento de Projetos e Usuários

Um microsserviço elegante e sofisticado para gerenciamento centralizado de usuários, projetos e equipes em uma plataforma de documentação inteligente de software. Implementa autenticação OAuth, controle de acesso baseado em papéis (RBAC), gerenciamento de projetos e recomendações inteligentes baseadas em histórico de acessos.

## Características Principais

**Autenticação e Autorização**
- Autenticação OAuth integrada via Manus
- Controle de acesso baseado em papéis (RBAC) com três níveis: ADMIN, GERENTE, MEMBRO
- Middlewares tRPC para proteção de endpoints

**Gerenciamento de Projetos**
- Criar, listar, visualizar e deletar projetos
- Associar usuários a projetos com papéis específicos
- Rastreamento de histórico de acessos

**Gerenciamento de Equipes**
- Adicionar e remover membros de projetos
- Definir papéis específicos por projeto (ADMIN, GERENTE, MEMBRO)
- Visualizar membros e suas atividades

**Sistema de Recomendação Inteligente**
- Análise de frequência de acessos do usuário
- Recomendações automáticas dos 5 projetos mais acessados
- Estatísticas de uso por projeto

**Interface Elegante**
- Dashboard com visão geral de projetos
- Estatísticas de atividade e recomendações
- Design responsivo e sofisticado
- Documentação arquitetural integrada

## Arquitetura

### Stack Tecnológico

**Frontend**
- React 19 com TypeScript
- Tailwind CSS 4 para estilização
- tRPC para chamadas RPC tipadas
- React Hook Form para gerenciamento de formulários
- Zod para validação de schemas

**Backend**
- Node.js com Express
- tRPC para framework RPC
- Drizzle ORM para gerenciamento de banco de dados
- MySQL/TiDB como banco de dados relacional
- JWT para autenticação

**Testes**
- Vitest para testes unitários
- 21 testes cobrindo RBAC, recomendações e autenticação

### Estrutura de Banco de Dados

**Tabelas Principais:**

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema com papéis globais (ADMIN, GERENTE, MEMBRO) |
| `projects` | Projetos de software gerenciados |
| `projectMembers` | Associação usuário-projeto com papéis específicos |
| `accessHistory` | Histórico de acessos para análise e recomendações |

### Fluxo de Integração

O microsserviço se integra com outros módulos através de:

1. **Validação de Acesso**: Outros microsserviços consultam `projectMembers.list` para validar permissões
2. **Registro de Atividade**: Cada acesso a um projeto registra em `accessHistory`
3. **Recomendações**: Algoritmo simples baseado em frequência de acessos
4. **Autenticação**: JWT compartilhado entre todos os microsserviços

## Como Usar

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Executar Testes

```bash
# Executar todos os testes
pnpm test

# Resultado esperado: 21 testes passando
```

### Endpoints Principais

**Autenticação**
- `GET /api/trpc/auth.me` - Obter usuário atual
- `POST /api/trpc/auth.logout` - Fazer logout

**Usuários**
- `GET /api/trpc/users.me` - Obter perfil do usuário
- `GET /api/trpc/users.list` - Listar todos os usuários (ADMIN)
- `GET /api/trpc/users.getById` - Obter usuário por ID
- `GET /api/trpc/users.getByOpenId` - Obter usuário por OpenID

**Projetos**
- `POST /api/trpc/projects.create` - Criar projeto (GERENTE+)
- `GET /api/trpc/projects.list` - Listar projetos do usuário
- `GET /api/trpc/projects.getById` - Obter detalhes do projeto
- `PATCH /api/trpc/projects.update` - Atualizar projeto (GERENTE+)
- `DELETE /api/trpc/projects.delete` - Deletar projeto (ADMIN)

**Membros de Projeto**
- `GET /api/trpc/projectMembers.list` - Listar membros
- `POST /api/trpc/projectMembers.add` - Adicionar membro (GERENTE+)
- `DELETE /api/trpc/projectMembers.remove` - Remover membro (GERENTE+)

**Recomendações**
- `GET /api/trpc/recommendations.getProjectRecommendations` - Obter recomendações
- `GET /api/trpc/recommendations.getAccessHistory` - Obter histórico de acessos
- `GET /api/trpc/recommendations.getProjectAccessStats` - Obter estatísticas de acesso

## Papéis e Permissões

### Papéis Globais

| Papel | Permissões |
|-------|-----------|
| **ADMIN** | Acesso total ao sistema, criar/editar/deletar projetos, gerenciar usuários |
| **GERENTE** | Criar projetos, gerenciar membros em seus projetos, visualizar projetos que participa |
| **MEMBRO** | Visualizar projetos que é membro, sem permissão de criar ou gerenciar |

### Papéis por Projeto

Cada usuário em um projeto tem um papel específico:
- **ADMIN do Projeto**: Gerencia membros e configurações do projeto
- **GERENTE do Projeto**: Pode gerenciar membros do projeto
- **MEMBRO do Projeto**: Apenas visualiza conteúdo do projeto

## Sistema de Recomendação

O algoritmo de recomendação utiliza uma abordagem simples mas eficaz baseada em frequência de acessos:

1. **Coleta de Dados**: Cada acesso a um projeto é registrado em `accessHistory`
2. **Contagem de Frequência**: Conta-se quantas vezes o usuário acessou cada projeto
3. **Ordenação**: Projetos são ordenados por frequência de acesso (descendente)
4. **Retorno**: Os 5 projetos mais acessados são recomendados

**Exemplo:**
```
Histórico de Acessos:
- Projeto A: 10 acessos
- Projeto B: 7 acessos
- Projeto C: 5 acessos
- Projeto D: 3 acessos
- Projeto E: 1 acesso

Recomendações (Top 5):
1. Projeto A (10 acessos)
2. Projeto B (7 acessos)
3. Projeto C (5 acessos)
4. Projeto D (3 acessos)
5. Projeto E (1 acesso)
```

## Fluxo de Uso

### 1. Autenticação
- Usuário clica em "Login" na página inicial
- Redirecionado para OAuth do Manus
- Retorna com token JWT e acessa o dashboard

### 2. Dashboard
- Visualiza projetos que é membro
- Vê recomendações baseadas em histórico
- Acessa estatísticas de atividade

### 3. Criar Projeto (GERENTE+)
- Clica em "Novo Projeto"
- Preenche nome e descrição
- Criador é automaticamente ADMIN do projeto

### 4. Gerenciar Equipe (GERENTE+)
- Acessa "Gerenciar Membros"
- Adiciona usuários com papéis específicos
- Remove membros conforme necessário

### 5. Visualizar Projeto
- Clica em projeto na lista
- Vê detalhes e membros
- Histórico de acesso é registrado automaticamente

## Testes

O projeto inclui 21 testes unitários cobrindo:

- **Autenticação**: Logout e gerenciamento de sessão
- **RBAC**: Verificação de permissões por papel
- **Recomendações**: Algoritmo de frequência de acessos
- **Estatísticas**: Análise de uso por projeto

### Executar Testes

```bash
pnpm test
```

**Resultado esperado:**
```
✓ server/auth.logout.test.ts (1 test)
✓ server/rbac.test.ts (16 tests)
✓ server/recommendations.test.ts (4 tests)

Test Files: 3 passed (3)
Tests: 21 passed (21)
```

## Integração com Outros Microsserviços

### Microsserviço de Documentação
- Recebe `projectId` para gerar documentação
- Consulta membros via `projectMembers.list`
- Usa histórico de acessos para priorizar documentação

### Microsserviço de Repositórios GitHub
- Recebe `projectId` para clonar repositórios
- Valida acesso do usuário ao projeto
- Registra acesso via `accessHistory`

### Microsserviço de Relatórios
- Consulta projetos do usuário
- Usa histórico de acessos para análise
- Gera relatórios por projeto

### Microsserviço de Apresentações
- Recebe `projectId` para gerar slides
- Valida permissões do usuário
- Registra acesso ao projeto

## Documentação Completa

Acesse a documentação arquitetural completa através da página `/documentation` no aplicativo, que inclui:

- Visão geral do sistema
- Arquitetura em camadas
- Explicação detalhada de RBAC
- Algoritmo de recomendação
- Modelo de dados
- Endpoints da API
- Padrões de integração
- Stack tecnológico

## Desenvolvimento

### Estrutura de Arquivos

```
project_management_microservice/
├── client/
│   └── src/
│       ├── pages/              # Páginas React
│       ├── components/         # Componentes reutilizáveis
│       ├── lib/               # Utilitários e configurações
│       └── App.tsx            # Roteamento principal
├── server/
│   ├── db.ts                  # Funções de banco de dados
│   ├── routers.ts             # Procedimentos tRPC
│   ├── *.test.ts              # Testes unitários
│   └── _core/                 # Código de infraestrutura
├── drizzle/
│   └── schema.ts              # Schema do banco de dados
└── README.md                  # Este arquivo
```

### Adicionar Novas Funcionalidades

1. **Definir schema** em `drizzle/schema.ts`
2. **Executar migrations**: `pnpm db:push`
3. **Adicionar helpers** em `server/db.ts`
4. **Criar procedimentos** em `server/routers.ts`
5. **Escrever testes** em `server/*.test.ts`
6. **Implementar UI** em `client/src/pages/`

## Apresentação Universitária

Este microsserviço foi desenvolvido como projeto de Engenharia de Software, demonstrando:

- **Arquitetura de Microsserviços**: Design modular e escalável
- **RBAC Avançado**: Controle de acesso em múltiplos níveis
- **Algoritmo de IA**: Recomendações baseadas em frequência
- **Testes Unitários**: Cobertura abrangente com Vitest
- **TypeScript End-to-End**: Tipagem completa frontend-backend
- **Design Elegante**: Interface sofisticada e responsiva
- **Documentação Completa**: Arquitetura e integração explicadas

## Licença

MIT

## Contato

Para dúvidas ou sugestões sobre este microsserviço, consulte a documentação integrada no aplicativo.
