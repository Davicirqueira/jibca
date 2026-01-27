# JIBCA Agenda - Backend

Sistema de agenda da Juventude da Igreja Batista Central de Americana.

## 🚀 Configuração Inicial

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### Instalação

1. **Clone e instale dependências:**
```bash
cd app/backend
npm install
```

2. **Configure o banco de dados PostgreSQL:**
```bash
# Criar banco de dados
createdb jibca_agenda

# Ou via psql
psql -U postgres
CREATE DATABASE jibca_agenda;
\q
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute migrations e seed:**
```bash
npm run setup
```

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Servidor
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jibca_agenda
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=24h
```

## 🏃‍♂️ Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
npm test
npm run test:watch
```

## 📊 Banco de Dados

### Estrutura
- **users**: Usuários (líderes e membros)
- **events**: Eventos da juventude
- **event_types**: Tipos de eventos
- **confirmations**: Confirmações de presença
- **notifications**: Notificações do sistema

### Comandos Úteis
```bash
# Executar migrations
npm run migrate

# Popular banco com dados de exemplo
npm run seed

# Setup completo (migrate + seed)
npm run setup
```

## 🔐 Credenciais Padrão

Após executar o seed:

**Líder:**
- Email: `chris@jibca.org`
- Senha: `jibca2024`

**Membros de exemplo:**
- Email: `joao@exemplo.com`, `maria@exemplo.com`, etc.
- Senha: `jibca2024`

> ⚠️ **Importante:** Altere as senhas padrão em produção!

## 📡 API Endpoints

### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout  
- `GET /api/v1/auth/me` - Perfil do usuário

### Usuários (Líder apenas)
- `POST /api/v1/users` - Criar membro
- `GET /api/v1/users` - Listar membros
- `GET /api/v1/users/:id` - Buscar membro
- `PUT /api/v1/users/:id` - Atualizar membro
- `DELETE /api/v1/users/:id` - Desativar membro

### Eventos
- `POST /api/v1/events` - Criar evento (Líder)
- `GET /api/v1/events` - Listar eventos
- `GET /api/v1/events/:id` - Detalhes do evento
- `PUT /api/v1/events/:id` - Atualizar evento (Líder)
- `DELETE /api/v1/events/:id` - Excluir evento (Líder)

### Confirmações
- `POST /api/v1/events/:id/confirmations` - Confirmar presença
- `GET /api/v1/events/:id/confirmations` - Listar confirmações

### Notificações
- `GET /api/v1/notifications` - Listar notificações
- `PUT /api/v1/notifications/:id/read` - Marcar como lida
- `PUT /api/v1/notifications/read-all` - Marcar todas como lidas

## 🏗️ Arquitetura

```
src/
├── config/          # Configurações (banco, etc.)
├── controllers/     # Controladores da API
├── middleware/      # Middlewares (auth, validação)
├── repositories/    # Camada de acesso a dados
├── routes/          # Definição das rotas
├── scripts/         # Scripts utilitários
├── services/        # Lógica de negócio
└── server.js        # Servidor principal
```

## 🧪 Testes

O projeto utiliza:
- **Jest** para testes unitários
- **fast-check** para testes baseados em propriedades
- **Supertest** para testes de API

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm test -- --coverage
```

## 📝 Logs

Os logs incluem:
- Conexões de banco de dados
- Execução de queries
- Erros de autenticação
- Operações da API

## 🔧 Troubleshooting

### Erro de conexão com banco
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env`
3. Teste a conexão: `psql -h localhost -U postgres -d jibca_agenda`

### Erro de JWT
1. Verifique se `JWT_SECRET` está definido no `.env`
2. Use uma chave forte (mínimo 32 caracteres)

### Erro de migrations
1. Verifique se o banco existe
2. Execute: `npm run migrate`
3. Se necessário, recrie o banco e execute `npm run setup`