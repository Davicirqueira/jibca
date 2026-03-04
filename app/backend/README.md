# JIBCA Agenda - Backend

Sistema de agenda da Juventude da Igreja Batista Castro Alves.

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

2. **Verifique a configuração:**
```bash
npm run check
```

3. **Configure o banco de dados PostgreSQL:**

**Opção 1 - Linha de comando:**
```bash
# Criar banco de dados
createdb jibca_agenda
```

**Opção 2 - Via psql:**
```bash
psql -U postgres
CREATE DATABASE jibca_agenda;
\q
```

4. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Execute migrations e seed:**
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

# Notificações
NOTIFICATION_ENABLED=true
DAILY_REMINDER_TIME=09:00
HOURLY_REMINDER_ENABLED=true
NOTIFICATION_CLEANUP_DAYS=90
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

## 🔧 Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Connection refused" (PostgreSQL)
1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Linux/Mac
   sudo service postgresql start
   ```

2. Teste a conexão:
   ```bash
   psql -h localhost -U postgres -d jibca_agenda
   ```

3. Verifique as credenciais no `.env`

### Erro: "Database does not exist"
```bash
# Criar o banco de dados
createdb jibca_agenda

# Ou via psql
psql -U postgres -c "CREATE DATABASE jibca_agenda;"
```

### Erro: "JWT_SECRET not configured"
1. Verifique se o arquivo `.env` existe
2. Adicione uma chave JWT segura:
   ```env
   JWT_SECRET=sua_chave_muito_segura_aqui_com_pelo_menos_32_caracteres
   ```

### Erro: "Migration failed"
1. Verifique se o banco existe
2. Execute as migrations manualmente:
   ```bash
   npm run migrate
   ```

### Erro: "Port already in use"
1. Mude a porta no `.env`:
   ```env
   PORT=3001
   ```
2. Ou mate o processo na porta 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
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
# Verificar configuração
npm run check

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
- `GET /api/v1/users/stats` - Estatísticas

### Eventos
- `POST /api/v1/events` - Criar evento (Líder)
- `GET /api/v1/events` - Listar eventos
- `GET /api/v1/events/:id` - Detalhes do evento
- `PUT /api/v1/events/:id` - Atualizar evento (Líder)
- `DELETE /api/v1/events/:id` - Excluir evento (Líder)
- `GET /api/v1/events/calendar` - Calendário
- `GET /api/v1/events/types` - Tipos disponíveis

### Confirmações
- `POST /api/v1/events/:id/confirmations` - Confirmar presença
- `GET /api/v1/events/:id/confirmations` - Listar confirmações
- `GET /api/v1/confirmations/me` - Minhas confirmações

### Notificações
- `GET /api/v1/notifications` - Listar notificações
- `PUT /api/v1/notifications/:id/read` - Marcar como lida
- `PUT /api/v1/notifications/read-all` - Marcar todas como lidas
- `GET /api/v1/notifications/unread-count` - Contador

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

## 🚨 Problemas Comuns

### 1. Erro "ECONNREFUSED"
- PostgreSQL não está rodando
- Credenciais incorretas no `.env`
- Porta do banco incorreta

### 2. Erro "relation does not exist"
- Migrations não foram executadas
- Execute: `npm run migrate`

### 3. Erro "duplicate key value"
- Tentativa de inserir dados duplicados
- Limpe o banco e execute: `npm run setup`

### 4. Servidor não inicia
- Porta já está em uso
- Variáveis de ambiente faltando
- Execute: `npm run check`