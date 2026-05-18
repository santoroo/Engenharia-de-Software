import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { ArrowLeft, Code2, Shield, Zap, Database, Users, Brain } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Documentation() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">Documentação Arquitetural</h1>
          <p className="text-muted-foreground mt-2">Microsserviço de Gerenciamento de Projetos e Usuários</p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Visão Geral do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
Este microsserviço é responsável pelo **gerenciamento centralizado de usuários, projetos e equipes** em uma plataforma de documentação inteligente de software. Ele fornece autenticação OAuth, controle de acesso baseado em papéis (RBAC), gerenciamento de projetos e recomendações inteligentes baseadas em histórico de acessos.

**Principais responsabilidades:**
- Autenticação e autorização de usuários
- Gerenciamento de projetos e equipes
- Controle de acesso baseado em papéis (ADMIN, GERENTE, MEMBRO)
- Rastreamento de histórico de acessos
- Recomendações inteligentes de projetos
            </Streamdown>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Arquitetura do Microsserviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Camadas Arquitetônicas

#### 1. **Camada de Apresentação (Frontend)**
- React 19 com Tailwind CSS 4
- Dashboard interativo com gerenciamento de projetos
- Interface elegante e responsiva
- Integração com tRPC para comunicação com backend

#### 2. **Camada de API (Backend)**
- FastAPI/Express com tRPC
- Procedimentos tRPC tipados end-to-end
- Autenticação OAuth integrada
- Validação de dados com Zod

#### 3. **Camada de Negócio**
- Lógica de RBAC (Role-Based Access Control)
- Gerenciamento de projetos e equipes
- Algoritmo de recomendação baseado em frequência
- Rastreamento de histórico de acessos

#### 4. **Camada de Dados**
- MySQL/TiDB como banco de dados principal
- Drizzle ORM para gerenciamento de dados
- Tabelas: users, projects, projectMembers, accessHistory
            </Streamdown>
          </CardContent>
        </Card>

        {/* RBAC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Controle de Acesso Baseado em Papéis (RBAC)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Papéis Globais do Sistema

| Papel | Permissões |
|-------|-----------|
| **ADMIN** | Acesso total ao sistema, pode criar/editar/deletar projetos, gerenciar usuários globalmente |
| **GERENTE** | Pode criar projetos, gerenciar membros em seus projetos, visualizar projetos que participa |
| **MEMBRO** | Pode apenas visualizar projetos que é membro, sem permissão de criar ou gerenciar |

### Papéis por Projeto

Cada usuário em um projeto tem um papel específico:
- **ADMIN do Projeto**: Gerencia membros e configurações do projeto
- **GERENTE do Projeto**: Pode gerenciar membros do projeto
- **MEMBRO do Projeto**: Apenas visualiza conteúdo do projeto

### Implementação

A verificação de RBAC é feita através de middlewares tRPC:
- `protectedProcedure`: Requer autenticação
- `gerenteProcedure`: Requer papel ADMIN ou GERENTE
- `adminProcedure`: Requer papel ADMIN
            </Streamdown>
          </CardContent>
        </Card>

        {/* IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Sistema de Recomendação Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Algoritmo de Recomendação

O sistema de recomendação utiliza um **algoritmo simples mas eficaz baseado em frequência de acessos**:

#### Passos do Algoritmo:

1. **Coleta de Dados**: Cada vez que um usuário acessa um projeto, registramos no histórico de acessos
2. **Contagem de Frequência**: Contamos quantas vezes o usuário acessou cada projeto
3. **Ordenação**: Ordenamos os projetos por frequência de acesso (descendente)
4. **Retorno de Top 5**: Retornamos os 5 projetos mais acessados

#### Exemplo:

```
Histórico de Acessos do Usuário:
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

### Benefícios

- **Simplicidade**: Fácil de entender e manter
- **Eficiência**: O(n log n) para ordenação
- **Escalabilidade**: Funciona bem com grandes volumes de dados
- **Relevância**: Reflete genuinamente os interesses do usuário
            </Streamdown>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Modelo de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Tabelas Principais

#### `users`
- `id`: Identificador único
- `openId`: Identificador OAuth
- `name`: Nome do usuário
- `email`: Email
- `role`: Papel global (ADMIN, GERENTE, MEMBRO)
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

#### `projects`
- `id`: Identificador único
- `name`: Nome do projeto
- `description`: Descrição
- `ownerId`: ID do criador
- `createdAt`, `updatedAt`: Timestamps

#### `projectMembers`
- `id`: Identificador único
- `projectId`: ID do projeto
- `userId`: ID do usuário
- `role`: Papel no projeto (ADMIN, GERENTE, MEMBRO)
- `joinedAt`, `updatedAt`: Timestamps

#### `accessHistory`
- `id`: Identificador único
- `userId`: ID do usuário
- `projectId`: ID do projeto
- `accessedAt`: Timestamp do acesso
            </Streamdown>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Endpoints da API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Autenticação
- `GET /api/trpc/auth.me` - Obter usuário atual
- `POST /api/trpc/auth.logout` - Fazer logout

### Usuários
- `GET /api/trpc/users.me` - Obter perfil do usuário
- `GET /api/trpc/users.list` - Listar todos os usuários (ADMIN)
- `GET /api/trpc/users.getById` - Obter usuário por ID
- `GET /api/trpc/users.getByOpenId` - Obter usuário por OpenID

### Projetos
- `POST /api/trpc/projects.create` - Criar projeto (GERENTE+)
- `GET /api/trpc/projects.list` - Listar projetos do usuário
- `GET /api/trpc/projects.getById` - Obter detalhes do projeto
- `PATCH /api/trpc/projects.update` - Atualizar projeto (GERENTE+)
- `DELETE /api/trpc/projects.delete` - Deletar projeto (ADMIN)

### Membros de Projeto
- `GET /api/trpc/projectMembers.list` - Listar membros
- `POST /api/trpc/projectMembers.add` - Adicionar membro (GERENTE+)
- `DELETE /api/trpc/projectMembers.remove` - Remover membro (GERENTE+)

### Recomendações
- `GET /api/trpc/recommendations.getProjectRecommendations` - Obter recomendações
- `GET /api/trpc/recommendations.getAccessHistory` - Obter histórico de acessos
- `GET /api/trpc/recommendations.getProjectAccessStats` - Obter estatísticas de acesso
            </Streamdown>
          </CardContent>
        </Card>

        {/* Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Integração com Outros Microsserviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Como Este Microsserviço se Integra

#### 1. **Microsserviço de Documentação**
- Recebe `projectId` para gerar documentação
- Consulta membros do projeto via `projectMembers.list`
- Usa histórico de acessos para priorizar documentação

#### 2. **Microsserviço de Repositórios GitHub**
- Recebe `projectId` para clonar repositórios
- Valida acesso do usuário ao projeto
- Registra acesso via `accessHistory`

#### 3. **Microsserviço de Relatórios**
- Consulta projetos do usuário
- Usa histórico de acessos para análise
- Gera relatórios por projeto

#### 4. **Microsserviço de Apresentações**
- Recebe `projectId` para gerar slides
- Valida permissões do usuário
- Registra acesso ao projeto

### Padrão de Integração

```
Outro Microsserviço
        ↓
Valida Token JWT
        ↓
Chama Endpoint tRPC
        ↓
Verifica RBAC
        ↓
Executa Operação
        ↓
Retorna Resultado
```

### Autenticação Entre Microsserviços

- Usa JWT (JSON Web Tokens) para comunicação
- Token contém: `userId`, `role`, `iat`, `exp`
- Cada microsserviço valida o token
- Compartilham mesma chave secreta
            </Streamdown>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Stack Tecnológico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Frontend
- **React 19**: Framework UI moderno
- **Tailwind CSS 4**: Estilização utilitária
- **TypeScript**: Tipagem estática
- **tRPC**: Chamadas RPC tipadas
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

### Backend
- **Node.js + Express**: Servidor HTTP
- **tRPC**: Framework RPC
- **Drizzle ORM**: Gerenciamento de banco de dados
- **MySQL 2**: Driver de banco de dados
- **Zod**: Validação de dados
- **JWT**: Autenticação

### Banco de Dados
- **MySQL/TiDB**: Banco de dados relacional
- **Drizzle Kit**: Migrations e schema management

### Testes
- **Vitest**: Framework de testes
- **21 testes**: Cobrindo RBAC, recomendações e autenticação
            </Streamdown>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Streamdown>
### Fluxo de Uso

#### 1. **Autenticação**
- Usuário clica em "Login" na página inicial
- Redirecionado para OAuth do Manus
- Retorna com token JWT

#### 2. **Dashboard**
- Visualiza projetos que é membro
- Vê recomendações baseadas em histórico
- Acessa estatísticas de atividade

#### 3. **Criar Projeto** (GERENTE+)
- Clica em "Novo Projeto"
- Preenche nome e descrição
- Criador é automaticamente ADMIN do projeto

#### 4. **Gerenciar Equipe** (GERENTE+)
- Acessa "Gerenciar Membros"
- Adiciona usuários com papéis específicos
- Remove membros conforme necessário

#### 5. **Visualizar Projeto**
- Clica em projeto na lista
- Vê detalhes e membros
- Histórico de acesso é registrado automaticamente

### Papéis e Permissões

**ADMIN Global**: Pode fazer tudo
**GERENTE**: Pode criar projetos e gerenciar membros
**MEMBRO**: Pode apenas visualizar
            </Streamdown>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
