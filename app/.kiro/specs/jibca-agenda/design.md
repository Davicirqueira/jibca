# Design - Sistema de Agenda da Juventude JIBCA

## Overview

O Sistema de Agenda da Juventude JIBCA é uma aplicação web full-stack que implementa uma arquitetura em três camadas: frontend React, backend Node.js/Express e banco de dados PostgreSQL. O sistema utiliza autenticação JWT, implementa controle de acesso baseado em roles (Líder/Membro) e oferece funcionalidades de gestão de eventos com confirmação de presença e sistema de notificações automáticas.

## Architecture

### Arquitetura Geral

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React + Vite)           │
│  - React Router (navegação)                 │
│  - Context API (gerenciamento de estado)    │
│  - Axios (cliente HTTP)                     │
│  - TailwindCSS (estilização)                │
└──────────────────┬──────────────────────────┘
                   │ HTTP/HTTPS
                   │ REST API
┌──────────────────▼──────────────────────────┐
│         BACKEND (Node.js + Express)         │
│  - Express.js (framework web)               │
│  - JWT (autenticação)                       │
│  - Express Validator (validação)            │
│  - Node-cron (notificações agendadas)       │
│  - bcrypt (hash de senhas)                  │
└──────────────────┬──────────────────────────┘
                   │ SQL
┌──────────────────▼──────────────────────────┐
│          DATABASE (PostgreSQL)              │
│  - pg (node-postgres driver)                │
│  - Migrations (node-pg-migrate)             │
│  - Índices otimizados                       │
└─────────────────────────────────────────────┘
```

### Padrões Arquiteturais

- **MVC (Model-View-Controller)**: Separação clara entre lógica de negócio, apresentação e controle
- **Repository Pattern**: Abstração da camada de acesso a dados
- **Middleware Pattern**: Interceptação de requisições para autenticação e validação
- **Observer Pattern**: Sistema de notificações baseado em eventos

## Components and Interfaces

### Frontend Components

#### Layout Components
- **Header**: Navegação principal, informações do usuário, logout
- **Sidebar**: Menu lateral com navegação contextual por role
- **Footer**: Informações da aplicação e links úteis

#### Authentication Components
- **LoginForm**: Formulário de autenticação com validação
- **ProtectedRoute**: Wrapper para rotas que requerem autenticação
- **RoleGuard**: Componente para controle de acesso baseado em roles

#### Event Components
- **EventList**: Lista paginada de eventos com filtros
- **EventCard**: Card individual de evento com informações resumidas
- **EventDetails**: Visualização completa do evento com confirmações
- **EventForm**: Formulário de criação/edição (apenas Líder)
- **EventCalendar**: Visualização em calendário mensal
- **ConfirmationButton**: Botão para confirmação de presença

#### Member Components (Líder apenas)
- **MemberList**: Lista paginada de membros
- **MemberCard**: Card individual de membro
- **MemberForm**: Formulário de cadastro/edição de membros

#### Notification Components
- **NotificationList**: Lista de notificações do usuário
- **NotificationItem**: Item individual de notificação
- **NotificationBadge**: Badge com contador de não lidas

### Backend Interfaces

#### Controllers
- **AuthController**: Gerencia autenticação e autorização
- **UserController**: CRUD de usuários (apenas Líder)
- **EventController**: CRUD de eventos
- **ConfirmationController**: Gerencia confirmações de presença
- **NotificationController**: Gerencia notificações

#### Services
- **AuthService**: Lógica de autenticação JWT
- **UserService**: Lógica de negócio para usuários
- **EventService**: Lógica de negócio para eventos
- **NotificationService**: Sistema de notificações automáticas
- **EmailService**: Envio de emails (futuro)

#### Repositories
- **UserRepository**: Acesso a dados de usuários
- **EventRepository**: Acesso a dados de eventos
- **ConfirmationRepository**: Acesso a dados de confirmações
- **NotificationRepository**: Acesso a dados de notificações

### API Interfaces

#### Authentication Endpoints
- `POST /api/v1/auth/login`: Autenticação de usuário
- `POST /api/v1/auth/logout`: Logout de usuário
- `GET /api/v1/auth/me`: Dados do usuário autenticado

#### User Management Endpoints (Líder apenas)
- `POST /api/v1/users`: Criar novo membro
- `GET /api/v1/users`: Listar membros
- `GET /api/v1/users/:id`: Buscar membro específico
- `PUT /api/v1/users/:id`: Atualizar membro
- `DELETE /api/v1/users/:id`: Desativar membro

#### Event Management Endpoints
- `POST /api/v1/events`: Criar evento (Líder apenas)
- `GET /api/v1/events`: Listar eventos
- `GET /api/v1/events/:id`: Buscar evento específico
- `PUT /api/v1/events/:id`: Atualizar evento (Líder apenas)
- `DELETE /api/v1/events/:id`: Excluir evento (Líder apenas)

#### Confirmation Endpoints
- `POST /api/v1/events/:id/confirmations`: Confirmar presença
- `GET /api/v1/events/:id/confirmations`: Listar confirmações

#### Notification Endpoints
- `GET /api/v1/notifications`: Listar notificações
- `PUT /api/v1/notifications/:id/read`: Marcar como lida
- `PUT /api/v1/notifications/read-all`: Marcar todas como lidas

## Data Models

### User Model
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'leader' | 'member';
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Event Model
```typescript
interface Event {
  id: number;
  title: string;
  description?: string;
  event_type_id: number;
  date: Date;
  time: string;
  location?: string;
  duration_minutes: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
```

### EventType Model
```typescript
interface EventType {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: Date;
}
```

### Confirmation Model
```typescript
interface Confirmation {
  id: number;
  event_id: number;
  user_id: number;
  status: 'confirmed' | 'declined' | 'maybe';
  confirmed_at: Date;
  updated_at: Date;
}
```

### Notification Model
```typescript
interface Notification {
  id: number;
  user_id: number;
  event_id?: number;
  type: 'event_reminder' | 'new_event' | 'event_updated';
  message: string;
  sent_at: Date;
  read_at?: Date;
}
```

### Database Schema

#### Relacionamentos
- User 1:N Event (created_by)
- User 1:N Confirmation
- User 1:N Notification
- Event 1:N Confirmation
- Event 1:N Notification
- EventType 1:N Event

#### Índices Otimizados
- `idx_events_date`: Otimiza consultas por data
- `idx_events_created_by`: Otimiza consultas por criador
- `idx_confirmations_event`: Otimiza consultas de confirmações por evento
- `idx_confirmations_user`: Otimiza consultas de confirmações por usuário
- `idx_notifications_user`: Otimiza consultas de notificações por usuário
- `idx_notifications_read`: Otimiza consultas de notificações não lidas
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

**Property 1: Valid credentials authentication**
*For any* valid email and password combination, authentication should result in a valid JWT token and active session
**Validates: Requirements 1.1**

**Property 2: Invalid credentials rejection**
*For any* invalid email or password combination, authentication should be rejected with appropriate error message
**Validates: Requirements 1.2**

**Property 3: Role differentiation**
*For any* authenticated user, the system should correctly identify and return their role (leader or member)
**Validates: Requirements 1.3**

**Property 4: Session termination**
*For any* authenticated user requesting logout, the session should be terminated and token invalidated
**Validates: Requirements 1.4**

**Property 5: Session persistence**
*For any* valid JWT token, the session should remain active until explicit logout or token expiration
**Validates: Requirements 1.5**

### User Management Properties

**Property 6: Member creation by leader**
*For any* valid member data provided by a leader, a new user with role 'member' should be created
**Validates: Requirements 2.1**

**Property 7: Member listing completeness**
*For any* database state, a leader requesting member list should receive all registered members
**Validates: Requirements 2.2**

**Property 8: Member data persistence**
*For any* valid member data update by a leader, the changes should be persisted in the database
**Validates: Requirements 2.3**

**Property 9: Member deactivation integrity**
*For any* active member, deactivation should set is_active to false without deleting the record
**Validates: Requirements 2.4**

**Property 10: Leader-only member management**
*For any* member management operation, only users with role 'leader' should have access
**Validates: Requirements 2.5**

### Event Management Properties

**Property 11: Event data completeness**
*For any* valid event created by a leader, all required fields (title, description, date, time, location, duration, type) should be stored
**Validates: Requirements 3.1**

**Property 12: Event update persistence**
*For any* valid event modification by a leader, the changes should be persisted with updated timestamp
**Validates: Requirements 3.2**

**Property 13: Event deletion cascade**
*For any* existing event, deletion should remove the event and all associated confirmations
**Validates: Requirements 3.3**

**Property 14: Event type validation**
*For any* event creation, only predefined event types (Culto, Retiro, Reunião, Estudo Bíblico, Confraternização, Evangelismo) should be accepted
**Validates: Requirements 3.4**

**Property 15: Leader-only event management**
*For any* event management operation, only users with role 'leader' should have access
**Validates: Requirements 3.5**

### Event Viewing Properties

**Property 16: Future events filtering**
*For any* member requesting event list, only events with date >= current date should be returned
**Validates: Requirements 4.1**

**Property 17: Event details completeness**
*For any* existing event, requesting details should return all event information including confirmations
**Validates: Requirements 4.2**

**Property 18: Event type filtering**
*For any* event type filter applied, only events matching that type should be returned
**Validates: Requirements 4.3**

**Property 19: Calendar view accuracy**
*For any* month selected, the calendar should display all events occurring within that month
**Validates: Requirements 4.4**

**Property 20: Universal event access**
*For any* authenticated user (leader or member), event viewing should be permitted
**Validates: Requirements 4.5**

### Confirmation Properties

**Property 21: Confirmation status validation**
*For any* presence confirmation, only valid statuses ('confirmed', 'declined', 'maybe') should be accepted
**Validates: Requirements 5.1**

**Property 22: Confirmation update persistence**
*For any* existing confirmation, status changes should be persisted with updated timestamp
**Validates: Requirements 5.2**

**Property 23: Participant list accuracy**
*For any* event with confirmations, the participant list should include all users who confirmed presence
**Validates: Requirements 5.3**

**Property 24: Confirmation counter accuracy**
*For any* event, confirmation counters should correctly reflect the number of confirmations per status
**Validates: Requirements 5.4**

**Property 25: Statistics calculation correctness**
*For any* set of events and confirmations, leader statistics should accurately calculate confirmation totals
**Validates: Requirements 5.5**

### Notification Properties

**Property 26: Daily reminder distribution**
*For any* event occurring in 24 hours, all active members should receive a reminder notification
**Validates: Requirements 6.1**

**Property 27: Hourly reminder targeting**
*For any* event occurring in 1 hour, only members with 'confirmed' status should receive a reminder
**Validates: Requirements 6.2**

**Property 28: New event notification broadcast**
*For any* newly created event, all active members should receive a notification
**Validates: Requirements 6.3**

**Property 29: Notification history completeness**
*For any* user, requesting notifications should return all their notifications ordered by date
**Validates: Requirements 6.4**

**Property 30: Read status update**
*For any* unread notification, marking as read should update the read_at timestamp
**Validates: Requirements 6.5**

### Security Properties

**Property 31: Password hashing consistency**
*For any* password provided, it should be stored as bcrypt hash and never in plain text
**Validates: Requirements 7.1**

**Property 32: JWT token validation**
*For any* authenticated request, the JWT token should be validated for signature and expiration
**Validates: Requirements 7.2**

**Property 33: Protected endpoint security**
*For any* protected endpoint, requests without valid authentication should be rejected
**Validates: Requirements 7.3**

**Property 34: Input validation security**
*For any* user input, malicious characters should be sanitized or rejected to prevent injection attacks
**Validates: Requirements 7.5**

## Error Handling

### Authentication Errors
- **Invalid Credentials**: Return 401 with clear error message
- **Expired Token**: Return 401 with token refresh instruction
- **Missing Token**: Return 401 with authentication requirement message

### Authorization Errors
- **Insufficient Permissions**: Return 403 with role requirement message
- **Resource Access Denied**: Return 403 with ownership requirement message

### Validation Errors
- **Invalid Input Data**: Return 400 with field-specific error messages
- **Missing Required Fields**: Return 400 with list of missing fields
- **Data Format Errors**: Return 400 with format requirement details

### Resource Errors
- **Not Found**: Return 404 with resource identification
- **Conflict**: Return 409 with conflict explanation (e.g., duplicate email)
- **Gone**: Return 410 for deleted/deactivated resources

### Server Errors
- **Database Connection**: Return 500 with generic error message (log details)
- **External Service**: Return 502 with service unavailable message
- **Timeout**: Return 504 with timeout explanation

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": ["Specific field errors or additional info"]
  }
}
```

## Testing Strategy

### Dual Testing Approach

O sistema implementará tanto testes unitários quanto testes baseados em propriedades para garantir cobertura abrangente:

#### Unit Testing
- **Framework**: Jest para backend, React Testing Library para frontend
- **Cobertura**: Componentes individuais, funções utilitárias, casos específicos
- **Foco**: Exemplos concretos, casos extremos, integração entre componentes
- **Execução**: Testes rápidos para feedback imediato durante desenvolvimento

#### Property-Based Testing
- **Framework**: fast-check para JavaScript/TypeScript
- **Configuração**: Mínimo de 100 iterações por propriedade para cobertura estatística
- **Identificação**: Cada teste deve incluir comentário referenciando a propriedade do design
- **Formato**: `**Feature: jibca-agenda, Property {number}: {property_text}**`
- **Implementação**: Uma propriedade de correção = um teste baseado em propriedades

#### Testing Requirements
- Cada propriedade de correção DEVE ser implementada por um único teste baseado em propriedades
- Testes unitários complementam testes de propriedades cobrindo casos específicos
- Geradores inteligentes devem ser criados para restringir o espaço de entrada adequadamente
- Testes devem evitar mocks quando possível para validar funcionalidade real
- Falhas de teste revelam bugs no código - o código deve ser corrigido, não os testes

### Test Data Generation Strategy

#### Smart Generators
- **User Generator**: Cria usuários válidos com diferentes roles e estados
- **Event Generator**: Gera eventos com datas futuras e tipos válidos
- **Confirmation Generator**: Cria confirmações com status válidos
- **Notification Generator**: Gera notificações com tipos e timestamps apropriados

#### Boundary Testing
- **Date Boundaries**: Eventos no limite entre passado/futuro
- **Time Boundaries**: Notificações nos limites de 24h e 1h
- **Role Boundaries**: Operações no limite entre permissões de leader/member
- **Status Boundaries**: Confirmações com todos os status válidos

### Integration Testing Strategy
- **API Integration**: Testes end-to-end das rotas da API
- **Database Integration**: Testes de persistência e consultas
- **Authentication Flow**: Testes completos de login/logout/autorização
- **Notification System**: Testes do sistema de notificações automáticas