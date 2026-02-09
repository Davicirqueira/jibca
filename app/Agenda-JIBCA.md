# Agenda JIBCA - Sistema de Gestão da Juventude

Sistema completo de gerenciamento de eventos, membros e comunicação para a Juventude da Igreja Batista Castro Alves.

---

## 📋 Visão Geral

A **Agenda JIBCA** é uma plataforma web desenvolvida para facilitar a organização e comunicação da juventude da igreja. O sistema permite que líderes gerenciem eventos, membros confirmem presença, e todos fiquem atualizados através de notificações automáticas.

### Objetivos Principais

- **Centralizar** a gestão de eventos da juventude em uma única plataforma
- **Facilitar** a comunicação entre líderes e membros
- **Automatizar** lembretes e notificações de eventos
- **Organizar** informações de membros e confirmações de presença
- **Visualizar** calendário de atividades de forma clara e intuitiva

---

## 🎯 Funcionalidades Principais

### Para Líderes

#### 1. Gestão de Eventos
- Criar, editar e excluir eventos
- Definir tipo de evento (Culto, Reunião, Estudo Bíblico, Passeio, Retiro, Conferência, Outro)
- Configurar data, horário e local
- Adicionar descrição detalhada
- Visualizar lista de confirmações de presença
- Acompanhar estatísticas de participação


#### 2. Administração de Membros
- Cadastrar novos membros
- Editar informações de membros existentes
- Desativar membros (soft delete)
- Visualizar estatísticas de membros
- Gerenciar permissões (Líder/Membro)

#### 3. Dashboard Administrativo
- Visão geral de eventos próximos
- Estatísticas de participação
- Resumo de notificações
- Acesso rápido a todos os módulos

### Para Membros

#### 1. Visualização de Eventos
- Listar todos os eventos futuros
- Ver detalhes completos de cada evento
- Visualizar calendário mensal
- Filtrar eventos por tipo

#### 2. Confirmação de Presença
- Confirmar ou cancelar presença em eventos
- Visualizar histórico de confirmações
- Receber notificações de eventos

#### 3. Perfil Pessoal
- Visualizar e editar informações pessoais
- Configurar preferências de notificações
- Gerenciar senha de acesso

### Sistema de Notificações

#### Notificações Automáticas
- **Criação de Evento**: Todos os membros são notificados quando um novo evento é criado
- **Lembrete Diário**: Notificação às 09:00 sobre eventos do dia
- **Lembrete de 1 Hora**: Notificação 1 hora antes do início do evento
- **Atualização de Evento**: Notificação quando evento é editado
- **Cancelamento**: Notificação quando evento é cancelado

#### Gerenciamento de Notificações
- Marcar notificações como lidas
- Marcar todas como lidas de uma vez
- Contador de notificações não lidas
- Limpeza automática de notificações antigas (90 dias)

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Banco de Dados**: PostgreSQL 12+
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: express-validator
- **Segurança**: Helmet, bcrypt, express-rate-limit
- **Agendamento**: node-cron
- **Monitoramento**: nodemon (desenvolvimento)
- **Testes**: Jest, Supertest, fast-check (property-based testing)

#### Frontend
- **Framework**: React 18
- **Roteamento**: React Router DOM v6
- **Formulários**: React Hook Form + Zod
- **Requisições HTTP**: Axios
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast
- **Build**: Vite
- **Testes**: Vitest, Testing Library

### Estrutura de Diretórios

```
app/
├── backend/                 # API REST Node.js
│   ├── src/
│   │   ├── config/         # Configurações (database, etc)
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (auth, validação)
│   │   ├── repositories/   # Camada de acesso a dados
│   │   ├── routes/         # Definição de rotas
│   │   ├── services/       # Lógica de negócio
│   │   ├── scripts/        # Scripts utilitários
│   │   └── server.js       # Servidor principal
│   ├── migrations/         # Migrations do banco de dados
│   └── __tests__/          # Testes automatizados
│
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   ├── context/       # Context API (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── schemas/       # Schemas de validação Zod
│   │   └── utils/         # Utilitários
│   └── dist/              # Build de produção
│
└── steering/              # Diretrizes de desenvolvimento
```

---

## 🗄️ Modelo de Dados

### Entidades Principais

#### Users (Usuários)
```
- id: UUID (PK)
- name: String
- email: String (unique)
- password: String (hashed)
- phone: String
- birth_date: Date
- role: Enum (leader, member)
- is_active: Boolean
- created_at: Timestamp
- updated_at: Timestamp
```

#### Events (Eventos)
```
- id: UUID (PK)
- title: String
- description: Text
- event_type_id: Integer (FK)
- event_date: Date
- event_time: Time
- location: String
- created_by: UUID (FK → users)
- created_at: Timestamp
- updated_at: Timestamp
```

#### Event_Types (Tipos de Evento)
```
- id: Serial (PK)
- name: String
- description: Text
- color: String (hex color)
```

Tipos disponíveis:
- Culto (#3b82f6 - azul)
- Reunião (#8b5cf6 - roxo)
- Estudo Bíblico (#f59e0b - amarelo)
- Passeio (#10b981 - verde)
- Retiro (#ec4899 - rosa)
- Conferência (#06b6d4 - ciano)
- Outro (#6b7280 - cinza)

#### Confirmations (Confirmações)
```
- id: UUID (PK)
- event_id: UUID (FK → events)
- user_id: UUID (FK → users)
- status: Enum (confirmed, cancelled)
- confirmed_at: Timestamp
- created_at: Timestamp
- updated_at: Timestamp
```

#### Notifications (Notificações)
```
- id: UUID (PK)
- user_id: UUID (FK → users)
- title: String
- message: Text
- type: Enum (event_created, event_reminder, event_updated, event_cancelled)
- related_event_id: UUID (FK → events, nullable)
- is_read: Boolean
- created_at: Timestamp
```

### Relacionamentos

- Um **User** pode criar vários **Events** (1:N)
- Um **Event** pertence a um **Event_Type** (N:1)
- Um **User** pode ter várias **Confirmations** (1:N)
- Um **Event** pode ter várias **Confirmations** (1:N)
- Um **User** pode ter várias **Notifications** (1:N)
- Uma **Notification** pode estar relacionada a um **Event** (N:1, opcional)

---

## 🔐 Autenticação e Autorização

### Sistema de Autenticação

- **Método**: JWT (JSON Web Tokens)
- **Duração do Token**: 24 horas (configurável)
- **Armazenamento**: localStorage no frontend
- **Refresh**: Automático em requisições
- **Hashing de Senhas**: bcrypt com salt rounds configurável

### Segurança e Rate Limiting

#### Rate Limiters Implementados

**Rate Limiter Geral:**
- **Janela**: 15 minutos (configurável via `RATE_LIMIT_WINDOW_MS`)
- **Limite**: 100 requisições por IP (configurável via `RATE_LIMIT_MAX_REQUESTS`)
- **Aplicação**: Todas as rotas da API

**Rate Limiter de Autenticação:**
- **Janela**: 15 minutos
- **Limite**: 5 tentativas de login (configurável via `AUTH_RATE_LIMIT_MAX`)
- **Comportamento**: Não conta requisições bem-sucedidas
- **Proteção**: Previne ataques de força bruta

**Rate Limiter de Recuperação de Senha:**
- **Janela**: 1 hora
- **Limite**: 3 solicitações (configurável via `RESET_PASSWORD_RATE_LIMIT_MAX`)
- **Chave**: Combinação de IP normalizado (IPv6-safe) + email
- **Proteção**: Previne abuso do sistema de recuperação

**Rate Limiter de Criação de Recursos:**
- **Janela**: 10 minutos
- **Limite**: 20 criações
- **Aplicação**: Endpoints de criação (eventos, membros, etc.)

**Rate Limiter de Operações Sensíveis:**
- **Janela**: 30 minutos
- **Limite**: 10 operações
- **Aplicação**: Exclusões, alterações de senha, desativações

#### Proteções de Segurança

- **Helmet.js**: Headers de segurança HTTP
- **CORS**: Configurado para aceitar apenas origens confiáveis
- **SQL Injection**: Proteção via queries parametrizadas (pg)
- **XSS**: Sanitização de inputs com express-validator
- **IPv6 Normalização**: Rate limiters com suporte adequado a IPv6
- **Password Policy**: Senhas hasheadas com bcrypt (10 rounds)

### Níveis de Permissão

#### Líder (leader)
- Todas as permissões de membro
- Criar, editar e excluir eventos
- Cadastrar e gerenciar membros
- Visualizar estatísticas completas
- Acessar dashboard administrativo

#### Membro (member)
- Visualizar eventos
- Confirmar/cancelar presença
- Editar próprio perfil
- Visualizar notificações
- Acessar calendário

### Rotas Protegidas

**Públicas:**
- `POST /api/v1/auth/login` - Login

**Autenticadas (qualquer usuário logado):**
- `GET /api/v1/auth/me` - Perfil atual
- `GET /api/v1/events` - Listar eventos
- `GET /api/v1/events/:id` - Detalhes do evento
- `POST /api/v1/events/:id/confirmations` - Confirmar presença
- `GET /api/v1/notifications` - Listar notificações

**Apenas Líderes:**
- `POST /api/v1/events` - Criar evento
- `PUT /api/v1/events/:id` - Editar evento
- `DELETE /api/v1/events/:id` - Excluir evento
- `POST /api/v1/users` - Criar membro
- `PUT /api/v1/users/:id` - Editar membro
- `DELETE /api/v1/users/:id` - Desativar membro
- `GET /api/v1/dashboard/*` - Estatísticas

---

## 🎨 Identidade Visual

### Paleta de Cores

#### Cor Primária - DarkRed
```
darkRed-primary: #8B0000    (cor tema principal)
darkRed-hover: #A52A2A      (estados hover)
darkRed-pressed: #6B0000    (estados active/pressed)
darkRed-light: rgba(139,0,0,0.1)   (backgrounds sutis)
```

#### Cores Estruturais
```
gray-50: #f9fafb     (backgrounds secundários)
gray-100: #f3f4f6    (cards, containers)
gray-200: #e5e7eb    (bordas sutis)
gray-300: #d1d5db    (bordas padrão)
gray-400: #9ca3af    (texto desabilitado)
gray-600: #4b5563    (texto secundário)
gray-700: #374151    (texto primário)
gray-900: #111827    (títulos)
white: #ffffff       (fundos principais)
```

#### Cores de Estado
```
success: #059669     (verde esmeralda)
warning: #d97706     (laranja âmbar)
error: #dc2626       (vermelho erro)
info: #0284c7        (azul informação)
```

### Tipografia

- **Fonte Principal**: System UI (Inter, SF Pro, Segoe UI)
- **Títulos**: 24-32px, semibold/bold
- **Subtítulos**: 18-20px, semibold
- **Corpo**: 14-16px, regular
- **Pequeno**: 12-13px, regular

### Componentes Visuais

- **Border Radius**: 8px (padrão), 12px (cards), 16px (modais)
- **Shadows**: Sutis e em camadas para profundidade
- **Transições**: 200-300ms cubic-bezier para suavidade
- **Espaçamentos**: Sistema de 4px (4, 8, 12, 16, 20, 24, 32, 40)

---

## 📱 Páginas e Fluxos

### Fluxo de Autenticação

1. **Login** (`/login`)
   - Formulário com email e senha
   - Validação de credenciais
   - Redirecionamento para dashboard

### Fluxo do Líder

1. **Dashboard** (`/dashboard`)
   - Visão geral do sistema
   - Acesso rápido a módulos
   
2. **Gerenciar Eventos** (`/events`)
   - Lista de todos os eventos
   - Criar novo evento (`/events/new`)
   - Editar evento (`/events/:id/edit`)
   - Ver detalhes e confirmações (`/events/:id`)

3. **Administrar Membros** (`/members`)
   - Lista de membros ativos
   - Criar novo membro (`/members/new`)
   - Editar membro (`/members/:id/edit`)

4. **Calendário** (`/calendar`)
   - Visualização mensal
   - Filtros por tipo de evento

5. **Notificações** (`/notifications`)
   - Lista de notificações
   - Marcar como lidas

6. **Perfil** (`/profile`)
   - Informações pessoais
   - Configurações

### Fluxo do Membro

1. **Dashboard** (`/dashboard`)
   - Eventos próximos
   - Notificações recentes

2. **Eventos** (`/events`)
   - Lista de eventos futuros
   - Ver detalhes (`/events/:id`)
   - Confirmar/cancelar presença

3. **Calendário** (`/calendar`)
   - Visualização mensal

4. **Notificações** (`/notifications`)
   - Lista de notificações

5. **Perfil** (`/profile`)
   - Informações pessoais
   - Configurações

---

## 🔔 Sistema de Notificações

### Tipos de Notificações

#### 1. Event Created (Evento Criado)
- **Quando**: Líder cria novo evento
- **Destinatários**: Todos os membros ativos
- **Conteúdo**: "Novo evento: [Título do Evento]"

#### 2. Event Reminder (Lembrete de Evento)
- **Quando**: 
  - Diariamente às 09:00 (eventos do dia)
  - 1 hora antes do evento
- **Destinatários**: Membros que confirmaram presença
- **Conteúdo**: "Lembrete: [Título do Evento] hoje às [Horário]"

#### 3. Event Updated (Evento Atualizado)
- **Quando**: Líder edita evento existente
- **Destinatários**: Membros que confirmaram presença
- **Conteúdo**: "Evento atualizado: [Título do Evento]"

#### 4. Event Cancelled (Evento Cancelado)
- **Quando**: Líder exclui evento
- **Destinatários**: Membros que confirmaram presença
- **Conteúdo**: "Evento cancelado: [Título do Evento]"

### Configurações de Notificações

- **Limpeza Automática**: Notificações com mais de 90 dias são removidas
- **Agendamento**: Utiliza node-cron para tarefas programadas
- **Persistência**: Armazenadas no banco de dados
- **Tempo Real**: Contador atualizado em tempo real no frontend

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

### Configuração do Backend

1. **Navegar para o diretório:**
```bash
cd app/backend
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

4. **Criar banco de dados:**
```bash
npm run create-db
```

5. **Executar migrations:**
```bash
npm run migrate
```

6. **Popular com dados iniciais:**
```bash
npm run seed
```

7. **Iniciar servidor:**
```bash
npm run dev
```

### Configuração do Frontend

1. **Navegar para o diretório:**
```bash
cd app/frontend
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis de ambiente:**
```bash
# Arquivo .env.development já configurado
```

4. **Iniciar aplicação:**
```bash
npm run dev
```

### Credenciais Padrão

Após executar o seed:

**Líder:**
- Email: `chris@jibca.org`
- Senha: `jibca2024`

**Membros:**
- Email: `joao@exemplo.com`, `maria@exemplo.com`, etc.
- Senha: `jibca2024`

> ⚠️ **Importante**: Altere as senhas padrão em produção!

---

## 🧪 Testes

### Backend

```bash
cd app/backend

# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm test -- --coverage
```

**Tipos de Testes:**
- Testes unitários (Jest)
- Testes de propriedades (fast-check)
- Testes de integração (Supertest)

### Frontend

```bash
cd app/frontend

# Executar todos os testes
npm test

# Executar com UI
npm run test:ui

# Executar com cobertura
npm run test:coverage
```

**Tipos de Testes:**
- Testes de componentes (Vitest + Testing Library)
- Testes de hooks customizados
- Testes de utilitários

---

## 📊 Estatísticas e Métricas

### Dashboard do Líder

#### Métricas de Eventos
- Total de eventos criados
- Eventos próximos (próximos 7 dias)
- Taxa média de confirmação
- Eventos por tipo

#### Métricas de Membros
- Total de membros ativos
- Novos membros (último mês)
- Taxa de participação
- Membros mais ativos

#### Métricas de Engajamento
- Notificações enviadas
- Taxa de leitura de notificações
- Confirmações por evento
- Tendências de participação

---

## 🔧 Manutenção e Operações

### Tarefas Agendadas (Cron Jobs)

#### Lembrete Diário
- **Horário**: 09:00 (configurável)
- **Função**: Notificar sobre eventos do dia
- **Configuração**: `DAILY_REMINDER_TIME` no .env

#### Lembrete de 1 Hora
- **Horário**: A cada hora
- **Função**: Notificar 1 hora antes dos eventos
- **Configuração**: `HOURLY_REMINDER_ENABLED` no .env

#### Limpeza de Notificações
- **Horário**: Diariamente à meia-noite
- **Função**: Remover notificações antigas
- **Configuração**: `NOTIFICATION_CLEANUP_DAYS` no .env

### Backup do Banco de Dados

```bash
# Backup completo
pg_dump -U postgres jibca_agenda > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres jibca_agenda < backup_20260205.sql
```

### Logs

- **Localização**: Console (desenvolvimento) / Arquivo (produção)
- **Níveis**: Error, Warn, Info, Debug
- **Conteúdo**: Requisições, queries, erros, autenticação

---

## 🚢 Deploy

### Backend (Produção)

```bash
cd app/backend

# Instalar dependências de produção
npm install --production

# Executar migrations
npm run migrate

# Iniciar servidor
npm start
```

### Frontend (Produção)

```bash
cd app/frontend

# Build de produção
npm run build

# Servir com nginx ou similar
# Os arquivos estarão em dist/
```

### Variáveis de Ambiente (Produção)

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://agenda.jibca.org

# Database
DB_HOST=seu-host-postgres
DB_PORT=5432
DB_NAME=jibca_agenda
DB_USER=seu-usuario
DB_PASSWORD=senha-segura

# JWT
JWT_SECRET=chave-jwt-muito-segura-minimo-32-caracteres
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
RESET_PASSWORD_RATE_LIMIT_MAX=3

# Notifications
DAILY_REMINDER_TIME=09:00
HOURLY_REMINDER_ENABLED=true
NOTIFICATION_CLEANUP_DAYS=90
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.agenda.jibca.org/api/v1
```

---

## �️ Seguerança e Boas Práticas

### Checklist de Segurança

#### Autenticação e Autorização
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Tokens JWT com expiração configurável
- ✅ Validação de permissões em todas as rotas protegidas
- ✅ Proteção contra força bruta com rate limiting

#### Proteção de API
- ✅ Rate limiting em múltiplos níveis (geral, auth, reset password, criação, operações sensíveis)
- ✅ Suporte adequado a IPv6 nos rate limiters
- ✅ Headers de segurança com Helmet.js
- ✅ CORS configurado para origens confiáveis
- ✅ Validação de entrada com express-validator

#### Banco de Dados
- ✅ Queries parametrizadas (proteção contra SQL injection)
- ✅ Soft delete para preservar integridade referencial
- ✅ Índices em campos frequentemente consultados
- ✅ Backup automático recomendado

#### Dados Sensíveis
- ✅ Variáveis de ambiente para credenciais
- ✅ .gitignore configurado para arquivos sensíveis
- ✅ Logs não expõem informações sensíveis
- ✅ Senhas nunca retornadas em respostas da API

### Recomendações de Produção

1. **HTTPS Obrigatório**: Configure certificado SSL/TLS
2. **Firewall**: Restrinja acesso ao banco de dados
3. **Monitoramento**: Implemente logs centralizados
4. **Backup**: Configure backup automático diário do banco
5. **Atualizações**: Mantenha dependências atualizadas
6. **Secrets**: Use gerenciador de secrets (AWS Secrets Manager, etc.)
7. **Rate Limiting**: Ajuste limites conforme necessidade
8. **Auditoria**: Revise logs de segurança regularmente

---

## 📚 Documentação Adicional

### Arquivos de Referência

- `app/backend/README.md` - Documentação técnica do backend
- `app/steering/diretrizes.md` - Diretrizes de design e implementação
- `app/steering/implementação.md` - Guia de implementação
- `app/steering/modernização.md` - Plano de modernização
- `.kiro/specs/jibca-critical-fixes/` - Especificações de correções críticas

### API Endpoints Completos

Consulte `app/backend/README.md` para lista completa de endpoints da API REST.

---

## 🤝 Contribuindo

### Padrões de Código

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branches**: feature/, bugfix/, hotfix/

### Fluxo de Desenvolvimento

1. Criar branch a partir de `main`
2. Implementar funcionalidade/correção
3. Escrever testes
4. Executar testes e linting
5. Criar pull request
6. Code review
7. Merge após aprovação

---

## 📝 Licença

MIT License - JIBCA (Juventude da Igreja Batista Central de Americana)

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação técnica em `app/backend/README.md`
- Verifique os arquivos de steering em `app/steering/`
- Entre em contato com a liderança da JIBCA

---

**Última atualização**: Fevereiro 2026
**Versão**: 1.0.0
**Status**: Em Produção

---

## 📋 Changelog

### v1.0.0 (Fevereiro 2026)
- ✅ Sistema completo de gestão de eventos
- ✅ Administração de membros com soft delete
- ✅ Sistema de notificações automáticas
- ✅ Dashboard com métricas em tempo real
- ✅ Calendário interativo
- ✅ Rate limiting com suporte IPv6
- ✅ Correções críticas de segurança
- ✅ Testes automatizados (unitários e property-based)
- ✅ Documentação completa

### Próximas Funcionalidades (Roadmap)
- 🔄 Sistema de recuperação de senha por email
- 🔄 Exportação de relatórios (PDF/Excel)
- 🔄 Integração com WhatsApp para notificações
- 🔄 App mobile (React Native)
- 🔄 Sistema de check-in presencial (QR Code)
- 🔄 Galeria de fotos de eventos
- 🔄 Sistema de enquetes e votações

---
