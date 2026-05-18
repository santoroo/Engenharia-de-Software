# Exemplos de Requisições e Respostas da API

## Autenticação

### Login via OAuth
**Endpoint**: `GET /api/oauth/callback?code=...&state=...`

**Resposta**:
```json
{
  "user": {
    "id": 1,
    "openId": "user-123",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "GERENTE",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "lastSignedIn": "2024-01-15T14:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Obter Usuário Atual
**Endpoint**: `GET /api/trpc/auth.me`

**Resposta**:
```json
{
  "id": 1,
  "openId": "user-123",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "GERENTE",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "lastSignedIn": "2024-01-15T14:30:00Z"
}
```

### Logout
**Endpoint**: `POST /api/trpc/auth.logout`

**Resposta**:
```json
{
  "success": true
}
```

## Usuários

### Listar Todos os Usuários (ADMIN)
**Endpoint**: `GET /api/trpc/users.list`

**Requisição**:
```bash
curl -X GET "http://localhost:3000/api/trpc/users.list" \
  -H "Authorization: Bearer <token>"
```

**Resposta**:
```json
[
  {
    "id": 1,
    "openId": "user-123",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "GERENTE",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "lastSignedIn": "2024-01-15T14:30:00Z"
  },
  {
    "id": 2,
    "openId": "user-456",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "role": "MEMBRO",
    "createdAt": "2024-01-02T10:00:00Z",
    "updatedAt": "2024-01-14T09:15:00Z",
    "lastSignedIn": "2024-01-14T09:15:00Z"
  }
]
```

### Obter Usuário por ID
**Endpoint**: `GET /api/trpc/users.getById?id=1`

**Requisição**:
```bash
curl -X GET "http://localhost:3000/api/trpc/users.getById?id=1" \
  -H "Authorization: Bearer <token>"
```

**Resposta**:
```json
{
  "id": 1,
  "openId": "user-123",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "GERENTE",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "lastSignedIn": "2024-01-15T14:30:00Z"
}
```

## Projetos

### Criar Projeto (GERENTE+)
**Endpoint**: `POST /api/trpc/projects.create`

**Requisição**:
```json
{
  "name": "Sistema de Documentação",
  "description": "Plataforma inteligente para documentação de software"
}
```

**Resposta**:
```json
{
  "id": 1,
  "name": "Sistema de Documentação",
  "description": "Plataforma inteligente para documentação de software",
  "ownerId": 1,
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

### Listar Projetos do Usuário
**Endpoint**: `GET /api/trpc/projects.list`

**Resposta**:
```json
[
  {
    "id": 1,
    "name": "Sistema de Documentação",
    "description": "Plataforma inteligente para documentação de software",
    "ownerId": 1,
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": 2,
    "name": "API REST de Vendas",
    "description": "Backend para e-commerce",
    "ownerId": 2,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-14T15:20:00Z"
  }
]
```

### Obter Detalhes do Projeto
**Endpoint**: `GET /api/trpc/projects.getById?id=1`

**Resposta**:
```json
{
  "id": 1,
  "name": "Sistema de Documentação",
  "description": "Plataforma inteligente para documentação de software",
  "ownerId": 1,
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

### Atualizar Projeto (GERENTE+)
**Endpoint**: `PATCH /api/trpc/projects.update`

**Requisição**:
```json
{
  "id": 1,
  "name": "Sistema de Documentação Inteligente",
  "description": "Plataforma com IA para documentação de software"
}
```

**Resposta**:
```json
{
  "id": 1,
  "name": "Sistema de Documentação Inteligente",
  "description": "Plataforma com IA para documentação de software",
  "ownerId": 1,
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T15:45:00Z"
}
```

### Deletar Projeto (ADMIN)
**Endpoint**: `DELETE /api/trpc/projects.delete?id=1`

**Resposta**:
```json
{
  "success": true,
  "message": "Projeto deletado com sucesso"
}
```

## Membros de Projeto

### Listar Membros do Projeto
**Endpoint**: `GET /api/trpc/projectMembers.list?projectId=1`

**Resposta**:
```json
[
  {
    "id": 1,
    "projectId": 1,
    "userId": 1,
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "GERENTE"
    },
    "role": "ADMIN",
    "joinedAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": 2,
    "projectId": 1,
    "userId": 2,
    "user": {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@example.com",
      "role": "MEMBRO"
    },
    "role": "MEMBRO",
    "joinedAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:00:00Z"
  }
]
```

### Adicionar Membro ao Projeto (GERENTE+)
**Endpoint**: `POST /api/trpc/projectMembers.add`

**Requisição**:
```json
{
  "projectId": 1,
  "userId": 2,
  "role": "MEMBRO"
}
```

**Resposta**:
```json
{
  "id": 2,
  "projectId": 1,
  "userId": 2,
  "role": "MEMBRO",
  "joinedAt": "2024-01-15T15:00:00Z",
  "updatedAt": "2024-01-15T15:00:00Z"
}
```

### Remover Membro do Projeto (GERENTE+)
**Endpoint**: `DELETE /api/trpc/projectMembers.remove?projectId=1&userId=2`

**Resposta**:
```json
{
  "success": true,
  "message": "Membro removido com sucesso"
}
```

## Recomendações

### Obter Recomendações de Projetos
**Endpoint**: `GET /api/trpc/recommendations.getProjectRecommendations`

**Resposta**:
```json
[
  {
    "id": 1,
    "name": "Sistema de Documentação",
    "description": "Plataforma inteligente para documentação de software",
    "ownerId": 1,
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "accessCount": 10
  },
  {
    "id": 2,
    "name": "API REST de Vendas",
    "description": "Backend para e-commerce",
    "ownerId": 2,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-14T15:20:00Z",
    "accessCount": 7
  },
  {
    "id": 3,
    "name": "Mobile App",
    "description": "Aplicativo mobile para iOS e Android",
    "ownerId": 3,
    "createdAt": "2024-01-05T09:00:00Z",
    "updatedAt": "2024-01-12T11:30:00Z",
    "accessCount": 5
  }
]
```

### Obter Histórico de Acessos
**Endpoint**: `GET /api/trpc/recommendations.getAccessHistory`

**Resposta**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "projectId": 1,
    "accessedAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "projectId": 1,
    "accessedAt": "2024-01-15T14:35:00Z"
  },
  {
    "id": 3,
    "userId": 1,
    "projectId": 2,
    "accessedAt": "2024-01-15T15:00:00Z"
  },
  {
    "id": 4,
    "userId": 1,
    "projectId": 1,
    "accessedAt": "2024-01-15T15:15:00Z"
  }
]
```

### Obter Estatísticas de Acesso por Projeto
**Endpoint**: `GET /api/trpc/recommendations.getProjectAccessStats?projectId=1`

**Resposta**:
```json
[
  {
    "userId": 1,
    "accessCount": 10,
    "lastAccess": "2024-01-15T15:15:00Z"
  },
  {
    "userId": 2,
    "accessCount": 5,
    "lastAccess": "2024-01-15T14:00:00Z"
  },
  {
    "userId": 3,
    "accessCount": 3,
    "lastAccess": "2024-01-14T10:30:00Z"
  }
]
```

## Códigos de Erro

### 400 - Requisição Inválida
```json
{
  "error": "PARSE_ERROR",
  "message": "Dados inválidos: 'name' é obrigatório"
}
```

### 401 - Não Autenticado
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token inválido ou expirado"
}
```

### 403 - Acesso Negado
```json
{
  "error": "FORBIDDEN",
  "message": "Você não tem permissão para acessar este recurso"
}
```

### 404 - Não Encontrado
```json
{
  "error": "NOT_FOUND",
  "message": "Projeto não encontrado"
}
```

### 500 - Erro Interno do Servidor
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Erro ao processar requisição"
}
```

## Autenticação

### Headers Necessários

Todas as requisições devem incluir o token JWT no header:

```bash
Authorization: Bearer <token>
```

### Exemplo com cURL

```bash
curl -X GET "http://localhost:3000/api/trpc/projects.list" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Exemplo com JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/trpc/projects.list', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

## Validações

### Criar Projeto

**Validações Obrigatórias**:
- `name`: String com mínimo 1 caractere
- `description`: String opcional

**Exemplo de Erro**:
```json
{
  "error": "PARSE_ERROR",
  "message": "name: String must contain at least 1 character(s)"
}
```

### Adicionar Membro

**Validações Obrigatórias**:
- `projectId`: Número inteiro positivo
- `userId`: Número inteiro positivo
- `role`: Uma de: "ADMIN", "GERENTE", "MEMBRO"

**Exemplo de Erro**:
```json
{
  "error": "PARSE_ERROR",
  "message": "role: Invalid enum value. Expected 'ADMIN' | 'GERENTE' | 'MEMBRO'"
}
```

## Rate Limiting

Atualmente, o sistema não possui rate limiting implementado. Para produção, recomenda-se:

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário
- Implementar com middleware Express ou serviço externo

## Paginação

Atualmente, o sistema retorna todos os resultados. Para implementar paginação:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Conclusão

Esta documentação fornece exemplos práticos de como usar a API do microsserviço. Para mais informações, consulte a documentação arquitetural em `ARCHITECTURE.md` ou acesse a página `/documentation` no aplicativo.
