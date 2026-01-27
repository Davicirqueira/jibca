# Requisitos - Sistema de Agenda da Juventude JIBCA

## Introdução

O Sistema de Agenda da Juventude JIBCA é um aplicativo web desenvolvido para facilitar o planejamento, organização e acompanhamento de eventos da igreja para a juventude. O sistema permite que líderes gerenciem eventos e membros, enquanto os jovens podem visualizar eventos, confirmar presença e receber notificações.

## Glossário

- **JIBCA**: Juventude da Igreja Batista Central de Americana
- **Sistema**: O aplicativo web de agenda da juventude JIBCA
- **Líder**: Usuário administrador com permissões completas (Tio Chris)
- **Membro**: Jovem da JIBCA com permissões de visualização e confirmação
- **Evento**: Atividade programada da juventude (culto, retiro, reunião, etc.)
- **Confirmação de Presença**: Status de participação do membro em um evento
- **Notificação**: Mensagem automática enviada aos usuários sobre eventos

## Requisitos

### Requisito 1

**User Story:** Como um usuário do sistema, eu quero fazer login com email e senha, para que eu possa acessar as funcionalidades do sistema de acordo com meu perfil.

#### Acceptance Criteria

1. WHEN um usuário fornece email e senha válidos, THE Sistema SHALL autenticar o usuário e criar uma sessão ativa
2. WHEN um usuário fornece credenciais inválidas, THE Sistema SHALL rejeitar o login e exibir mensagem de erro
3. WHEN um usuário está autenticado, THE Sistema SHALL diferenciar entre perfis de Líder e Membro
4. WHEN um usuário solicita logout, THE Sistema SHALL encerrar a sessão ativa
5. WHILE um usuário está autenticado, THE Sistema SHALL manter a sessão ativa até o logout

### Requisito 2

**User Story:** Como um Líder, eu quero gerenciar membros da juventude, para que eu possa manter o cadastro atualizado e controlar o acesso ao sistema.

#### Acceptance Criteria

1. WHEN um Líder cadastra um novo membro, THE Sistema SHALL criar o usuário com perfil de Membro
2. WHEN um Líder solicita a lista de membros, THE Sistema SHALL exibir todos os membros cadastrados
3. WHEN um Líder edita informações de um membro, THE Sistema SHALL atualizar os dados no banco de dados
4. WHEN um Líder desativa um membro, THE Sistema SHALL marcar o usuário como inativo sem excluir os dados
5. THE Sistema SHALL validar que apenas usuários com perfil de Líder podem gerenciar membros

### Requisito 3

**User Story:** Como um Líder, eu quero criar e gerenciar eventos da juventude, para que eu possa organizar as atividades e manter os membros informados.

#### Acceptance Criteria

1. WHEN um Líder cria um evento, THE Sistema SHALL armazenar título, descrição, data, horário, local, duração e tipo
2. WHEN um Líder edita um evento existente, THE Sistema SHALL atualizar as informações mantendo o histórico
3. WHEN um Líder exclui um evento, THE Sistema SHALL remover o evento e todas as confirmações associadas
4. WHEN um Líder define o tipo de evento, THE Sistema SHALL permitir seleção entre Culto, Retiro, Reunião, Estudo Bíblico, Confraternização e Evangelismo
5. THE Sistema SHALL validar que apenas usuários com perfil de Líder podem gerenciar eventos

### Requisito 4

**User Story:** Como um Membro, eu quero visualizar eventos da juventude, para que eu possa me manter informado sobre as atividades programadas.

#### Acceptance Criteria

1. WHEN um Membro acessa a lista de eventos, THE Sistema SHALL exibir todos os eventos futuros
2. WHEN um Membro seleciona um evento, THE Sistema SHALL exibir detalhes completos incluindo confirmações
3. WHEN um Membro aplica filtro por tipo, THE Sistema SHALL exibir apenas eventos do tipo selecionado
4. WHEN um Membro acessa o calendário, THE Sistema SHALL exibir eventos em formato de calendário mensal
5. THE Sistema SHALL permitir que todos os usuários autenticados visualizem eventos

### Requisito 5

**User Story:** Como um Membro, eu quero confirmar minha presença em eventos, para que o Líder possa planejar adequadamente as atividades.

#### Acceptance Criteria

1. WHEN um Membro confirma presença, THE Sistema SHALL registrar o status como "Vou", "Não vou" ou "Talvez"
2. WHEN um Membro altera uma confirmação existente, THE Sistema SHALL atualizar o status mantendo o histórico
3. WHEN um Membro visualiza um evento, THE Sistema SHALL exibir lista de participantes que confirmaram presença
4. WHEN eventos são exibidos, THE Sistema SHALL mostrar contador de confirmações por status
5. WHEN um Líder acessa estatísticas, THE Sistema SHALL exibir relatório completo de confirmações por evento

### Requisito 6

**User Story:** Como um usuário do sistema, eu quero receber notificações sobre eventos, para que eu não perca atividades importantes da juventude.

#### Acceptance Criteria

1. WHEN falta 1 dia para um evento, THE Sistema SHALL enviar lembrete automático para todos os membros
2. WHEN falta 1 hora para um evento, THE Sistema SHALL enviar lembrete automático para membros confirmados
3. WHEN um novo evento é criado, THE Sistema SHALL notificar todos os membros sobre o evento
4. WHEN um usuário acessa notificações, THE Sistema SHALL exibir histórico de mensagens recebidas
5. WHEN um usuário marca notificação como lida, THE Sistema SHALL atualizar o status de leitura

### Requisito 7

**User Story:** Como um usuário do sistema, eu quero que minhas informações sejam protegidas, para que meus dados pessoais e de acesso estejam seguros.

#### Acceptance Criteria

1. WHEN senhas são armazenadas, THE Sistema SHALL utilizar hash bcrypt para criptografia
2. WHEN usuários fazem requisições autenticadas, THE Sistema SHALL validar tokens JWT
3. WHEN endpoints protegidos são acessados, THE Sistema SHALL verificar autenticação via middleware
4. WHEN dados sensíveis são transmitidos, THE Sistema SHALL utilizar conexões HTTPS
5. THE Sistema SHALL implementar validação de entrada para prevenir ataques de injeção

### Requisito 8

**User Story:** Como um usuário do sistema, eu quero uma interface responsiva e intuitiva, para que eu possa usar o sistema facilmente em qualquer dispositivo.

#### Acceptance Criteria

1. WHEN o sistema é acessado em dispositivos móveis, THE Sistema SHALL adaptar a interface automaticamente
2. WHEN usuários executam ações, THE Sistema SHALL fornecer feedback visual imediato
3. WHEN o sistema responde a requisições, THE Sistema SHALL manter tempo de resposta inferior a 500ms
4. WHEN múltiplos usuários acessam simultaneamente, THE Sistema SHALL suportar pelo menos 100 usuários
5. THE Sistema SHALL seguir princípios de design mobile-first para otimizar a experiência