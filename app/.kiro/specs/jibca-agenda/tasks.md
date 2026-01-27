# Plano de Implementação - Sistema de Agenda da Juventude JIBCA

- [x] 1. Configurar estrutura do projeto e dependências






  - Criar estrutura de pastas para backend (Node.js/Express) e frontend (React/Vite)
  - Configurar package.json com dependências necessárias (express, pg, bcrypt, jsonwebtoken, react, axios, tailwindcss)
  - Configurar scripts de desenvolvimento e build
  - Configurar variáveis de ambiente
  - _Requirements: 8.3, 8.4_

- [x] 2. Configurar banco de dados PostgreSQL


  - Criar script de configuração do banco de dados
  - Implementar migrations para criação das tabelas (users, events, event_types, confirmations, notifications)
  - Criar índices otimizados para performance
  - Implementar seed data com tipos de eventos e usuário líder inicial
  - _Requirements: 7.1, 8.3_

- [x] 3. Implementar sistema de autenticação


  - [x] 3.1 Criar middleware de autenticação JWT


    - Implementar geração e validação de tokens JWT
    - Criar middleware para verificação de autenticação
    - Implementar middleware para verificação de roles
    - _Requirements: 1.1, 1.3, 7.2, 7.3_

  - [ ]* 3.2 Escrever teste de propriedade para autenticação válida
    - **Property 1: Valid credentials authentication**
    - **Validates: Requirements 1.1**

  - [ ]* 3.3 Escrever teste de propriedade para rejeição de credenciais inválidas
    - **Property 2: Invalid credentials rejection**
    - **Validates: Requirements 1.2**

  - [x] 3.4 Implementar AuthController


    - Criar endpoint POST /auth/login para autenticação
    - Criar endpoint POST /auth/logout para logout
    - Criar endpoint GET /auth/me para dados do usuário
    - Implementar hash de senhas com bcrypt
    - _Requirements: 1.1, 1.2, 1.4, 7.1_

  - [ ]* 3.5 Escrever teste de propriedade para diferenciação de roles
    - **Property 3: Role differentiation**
    - **Validates: Requirements 1.3**

  - [ ]* 3.6 Escrever teste de propriedade para terminação de sessão
    - **Property 4: Session termination**
    - **Validates: Requirements 1.4**

- [x] 4. Implementar gestão de usuários



  - [x] 4.1 Criar UserRepository para acesso a dados


    - Implementar métodos CRUD para usuários
    - Implementar consultas otimizadas com paginação
    - Implementar soft delete para desativação
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Implementar UserController (apenas para Líderes)


    - Criar endpoint POST /users para cadastro de membros
    - Criar endpoint GET /users para listagem com paginação
    - Criar endpoint GET /users/:id para busca específica
    - Criar endpoint PUT /users/:id para atualização
    - Criar endpoint DELETE /users/:id para desativação
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.3 Escrever teste de propriedade para criação de membros
    - **Property 6: Member creation by leader**
    - **Validates: Requirements 2.1**

  - [ ]* 4.4 Escrever teste de propriedade para listagem completa de membros
    - **Property 7: Member listing completeness**
    - **Validates: Requirements 2.2**

  - [ ]* 4.5 Escrever teste de propriedade para persistência de dados de membros
    - **Property 8: Member data persistence**
    - **Validates: Requirements 2.3**

  - [ ]* 4.6 Escrever teste de propriedade para desativação de membros
    - **Property 9: Member deactivation integrity**
    - **Validates: Requirements 2.4**

- [ ] 5. Implementar gestão de eventos
  - [ ] 5.1 Criar EventRepository para acesso a dados
    - Implementar métodos CRUD para eventos
    - Implementar consultas com filtros (tipo, data, futuro)
    - Implementar consultas para calendário mensal
    - Implementar cascade delete para confirmações
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.3, 4.4_

  - [ ] 5.2 Implementar EventController
    - Criar endpoint POST /events para criação (apenas Líder)
    - Criar endpoint GET /events para listagem com filtros
    - Criar endpoint GET /events/:id para detalhes completos
    - Criar endpoint PUT /events/:id para atualização (apenas Líder)
    - Criar endpoint DELETE /events/:id para exclusão (apenas Líder)
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.5_

  - [ ]* 5.3 Escrever teste de propriedade para completude de dados do evento
    - **Property 11: Event data completeness**
    - **Validates: Requirements 3.1**

  - [ ]* 5.4 Escrever teste de propriedade para validação de tipos de evento
    - **Property 14: Event type validation**
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 Escrever teste de propriedade para filtragem de eventos futuros
    - **Property 16: Future events filtering**
    - **Validates: Requirements 4.1**

- [ ] 6. Implementar sistema de confirmações
  - [ ] 6.1 Criar ConfirmationRepository
    - Implementar métodos para criar/atualizar confirmações
    - Implementar consultas para listagem por evento
    - Implementar cálculo de estatísticas de confirmação
    - Implementar constraint de unicidade (um usuário por evento)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 6.2 Implementar ConfirmationController
    - Criar endpoint POST /events/:id/confirmations para confirmação
    - Criar endpoint GET /events/:id/confirmations para listagem
    - Implementar validação de status válidos
    - Implementar atualização de confirmações existentes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.3 Escrever teste de propriedade para validação de status de confirmação
    - **Property 21: Confirmation status validation**
    - **Validates: Requirements 5.1**

  - [ ]* 6.4 Escrever teste de propriedade para precisão dos contadores
    - **Property 24: Confirmation counter accuracy**
    - **Validates: Requirements 5.4**

- [ ] 7. Implementar sistema de notificações
  - [ ] 7.1 Criar NotificationRepository
    - Implementar métodos para criar notificações
    - Implementar consultas para listagem por usuário
    - Implementar marcação de leitura
    - Implementar contagem de não lidas
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 7.2 Implementar NotificationService com agendamento
    - Criar serviço para envio de lembretes automáticos
    - Implementar job para lembrete de 24 horas
    - Implementar job para lembrete de 1 hora
    - Implementar notificação para novos eventos
    - Configurar node-cron para execução automática
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 7.3 Implementar NotificationController
    - Criar endpoint GET /notifications para listagem
    - Criar endpoint PUT /notifications/:id/read para marcar como lida
    - Criar endpoint PUT /notifications/read-all para marcar todas
    - _Requirements: 6.4, 6.5_

  - [ ]* 7.4 Escrever teste de propriedade para distribuição de lembretes diários
    - **Property 26: Daily reminder distribution**
    - **Validates: Requirements 6.1**

  - [ ]* 7.5 Escrever teste de propriedade para direcionamento de lembretes por hora
    - **Property 27: Hourly reminder targeting**
    - **Validates: Requirements 6.2**

- [ ] 8. Checkpoint - Verificar funcionamento do backend
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implementar frontend React
  - [ ] 9.1 Configurar estrutura base do frontend
    - Configurar Vite com React e TypeScript
    - Configurar TailwindCSS para estilização
    - Configurar React Router para navegação
    - Configurar Axios para chamadas HTTP
    - Criar estrutura de pastas (components, pages, services, context)
    - _Requirements: 8.1, 8.2_

  - [ ] 9.2 Implementar Context de Autenticação
    - Criar AuthContext para gerenciamento de estado
    - Implementar hooks useAuth para acesso ao contexto
    - Implementar persistência de token no localStorage
    - Criar componente ProtectedRoute para rotas protegidas
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 9.3 Implementar tela de Login
    - Criar componente LoginForm com validação
    - Implementar integração com API de autenticação
    - Implementar redirecionamento baseado em role
    - Implementar feedback visual para erros
    - _Requirements: 1.1, 1.2, 8.2_

- [ ] 10. Implementar interface de eventos
  - [ ] 10.1 Criar componentes de listagem de eventos
    - Implementar EventList com paginação
    - Implementar EventCard para exibição resumida
    - Implementar filtros por tipo de evento
    - Implementar filtro para eventos futuros
    - _Requirements: 4.1, 4.3, 8.1_

  - [ ] 10.2 Implementar visualização detalhada de eventos
    - Criar componente EventDetails
    - Implementar exibição de confirmações de presença
    - Implementar contadores de confirmação por status
    - Implementar botão de confirmação de presença
    - _Requirements: 4.2, 5.3, 5.4_

  - [ ] 10.3 Implementar calendário de eventos
    - Criar componente EventCalendar
    - Implementar visualização mensal
    - Implementar navegação entre meses
    - Implementar integração com dados de eventos
    - _Requirements: 4.4_

  - [ ] 10.4 Implementar formulário de eventos (apenas Líder)
    - Criar componente EventForm para criação/edição
    - Implementar validação de campos obrigatórios
    - Implementar seleção de tipos de evento
    - Implementar integração com API de eventos
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 11. Implementar interface de gestão de membros (apenas Líder)
  - [ ] 11.1 Criar listagem de membros
    - Implementar MemberList com paginação
    - Implementar MemberCard para exibição
    - Implementar filtros por status ativo/inativo
    - _Requirements: 2.2, 2.5_

  - [ ] 11.2 Implementar formulário de membros
    - Criar MemberForm para cadastro/edição
    - Implementar validação de email único
    - Implementar geração de senha inicial
    - Implementar opção de desativação
    - _Requirements: 2.1, 2.3, 2.4_

- [ ] 12. Implementar interface de notificações
  - [ ] 12.1 Criar sistema de notificações no frontend
    - Implementar NotificationList para histórico
    - Implementar NotificationBadge com contador
    - Implementar marcação de leitura
    - Implementar atualização em tempo real (polling)
    - _Requirements: 6.4, 6.5_

- [ ] 13. Implementar sistema de confirmação de presença
  - [ ] 13.1 Criar componentes de confirmação
    - Implementar ConfirmationButton com três estados
    - Implementar feedback visual para confirmação
    - Implementar atualização otimista da interface
    - Implementar sincronização com backend
    - _Requirements: 5.1, 5.2, 8.2_

- [ ] 14. Implementar validação e segurança no frontend
  - [ ] 14.1 Implementar validação de formulários
    - Criar funções de validação para todos os campos
    - Implementar sanitização de entrada do usuário
    - Implementar feedback visual para erros de validação
    - _Requirements: 7.5, 8.2_

  - [ ]* 14.2 Escrever teste de propriedade para validação de segurança de entrada
    - **Property 34: Input validation security**
    - **Validates: Requirements 7.5**

- [ ] 15. Implementar responsividade e acessibilidade
  - [ ] 15.1 Otimizar para dispositivos móveis
    - Implementar design mobile-first com TailwindCSS
    - Testar responsividade em diferentes tamanhos de tela
    - Implementar navegação otimizada para mobile
    - _Requirements: 8.1, 8.5_

  - [ ] 15.2 Implementar feedback visual
    - Criar componentes de loading para operações assíncronas
    - Implementar toasts para feedback de ações
    - Implementar estados de erro com retry
    - _Requirements: 8.2_

- [ ] 16. Checkpoint final - Testes de integração
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Configurar ambiente de produção
  - [ ] 17.1 Configurar build de produção
    - Configurar build otimizado do frontend
    - Configurar variáveis de ambiente para produção
    - Implementar configuração de HTTPS
    - _Requirements: 7.4, 8.3_

  - [ ]* 17.2 Escrever testes de integração end-to-end
    - Implementar testes de fluxo completo de usuário
    - Testar integração entre frontend e backend
    - Validar funcionamento em ambiente de produção




Caso não tenha deixado claro anteriormente, os membros poderão editar somente seus dados individuais.