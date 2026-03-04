# Requirements Document

## Introduction

Este documento especifica os requisitos para ativar o sistema de recuperação de senha por email na Agenda JIBCA. O sistema já possui toda a infraestrutura implementada (tokens, validações, interfaces), faltando apenas ativar o envio de emails via Gmail SMTP.

## Glossary

- **Sistema**: Agenda JIBCA (backend Node.js + frontend React)
- **Membro**: Jovem cadastrado no sistema com role 'member' ou 'leader'
- **Token de Recuperação**: String única de 64 caracteres gerada para recuperação de senha
- **Email Service**: Serviço responsável por enviar emails via SMTP
- **Gmail SMTP**: Servidor de email do Google configurado com App Password
- **App Password**: Senha de 16 caracteres gerada pelo Google para aplicações
- **Link de Recuperação**: URL contendo token que redireciona para página de redefinição

## Requirements

### Requirement 1

**User Story:** Como membro, eu quero receber um email com link de recuperação quando esquecer minha senha, para que eu possa redefinir minha senha de forma segura e autônoma.

#### Acceptance Criteria

1. WHEN um membro solicita recuperação de senha THEN o Sistema SHALL enviar um email para o endereço cadastrado contendo um link de recuperação válido por 60 minutos
2. WHEN o email de recuperação é enviado THEN o Sistema SHALL incluir o nome do membro, instruções claras e o link clicável de recuperação
3. WHEN o membro clica no link de recuperação THEN o Sistema SHALL validar o token e redirecionar para a página de redefinição de senha
4. WHEN o token de recuperação expira (60 minutos) THEN o Sistema SHALL rejeitar o token e informar que ele expirou
5. WHEN o membro redefine a senha com sucesso THEN o Sistema SHALL invalidar todos os tokens de recuperação daquele usuário

### Requirement 2

**User Story:** Como administrador do sistema, eu quero que o envio de emails seja configurável e confiável, para que o sistema funcione corretamente em desenvolvimento e produção.

#### Acceptance Criteria

1. WHEN o Sistema inicia THEN o Sistema SHALL carregar as configurações de email das variáveis de ambiente
2. WHEN as configurações de email estão ausentes ou inválidas THEN o Sistema SHALL registrar erro no log e desabilitar envio de emails
3. WHEN o envio de email falha THEN o Sistema SHALL registrar o erro detalhado no log incluindo destinatário e motivo da falha
4. WHEN o envio de email é bem-sucedido THEN o Sistema SHALL registrar no log o destinatário e timestamp do envio
5. WHEN o Sistema está em modo desenvolvimento THEN o Sistema SHALL exibir informações adicionais de debug nos logs

### Requirement 3

**User Story:** Como desenvolvedor, eu quero templates de email profissionais e responsivos, para que os membros tenham uma boa experiência ao receber emails do sistema.

#### Acceptance Criteria

1. WHEN um email é enviado THEN o Sistema SHALL usar template HTML responsivo que funciona em clientes de email desktop e mobile
2. WHEN o template é renderizado THEN o Sistema SHALL incluir a identidade visual da JIBCA (cores, nome, logo se disponível)
3. WHEN o email contém link de recuperação THEN o Sistema SHALL destacar visualmente o botão/link de ação principal
4. WHEN o email é visualizado THEN o Sistema SHALL garantir que o texto seja legível com contraste adequado
5. WHEN o membro não consegue clicar no link THEN o Sistema SHALL incluir a URL completa como texto alternativo

### Requirement 4

**User Story:** Como líder, eu quero ser notificado quando membros solicitam recuperação de senha, para que eu possa auxiliar caso haja problemas com o email.

#### Acceptance Criteria

1. WHEN um membro solicita recuperação de senha THEN o Sistema SHALL criar notificação interna para todos os líderes ativos
2. WHEN a notificação é criada THEN o Sistema SHALL incluir nome e email do membro que solicitou recuperação
3. WHEN o líder visualiza a notificação THEN o Sistema SHALL exibir timestamp da solicitação
4. WHEN múltiplas solicitações são feitas pelo mesmo membro THEN o Sistema SHALL criar notificação para cada solicitação
5. WHEN o email é enviado com sucesso THEN o Sistema SHALL incluir essa informação na notificação ao líder

### Requirement 5

**User Story:** Como membro, eu quero que o processo de recuperação seja seguro e protegido contra abusos, para que minha conta permaneça protegida.

#### Acceptance Criteria

1. WHEN um membro solicita recuperação de senha THEN o Sistema SHALL limitar a 3 solicitações por hora por combinação de IP e email
2. WHEN o limite de solicitações é excedido THEN o Sistema SHALL rejeitar novas solicitações e retornar erro HTTP 429
3. WHEN um email não cadastrado é usado THEN o Sistema SHALL retornar mensagem genérica de sucesso sem revelar se o email existe
4. WHEN um token é usado para redefinir senha THEN o Sistema SHALL marcar o token como usado e invalidar todos os outros tokens do usuário
5. WHEN tentativas de força bruta são detectadas THEN o Sistema SHALL registrar no log o IP e email para auditoria

### Requirement 6

**User Story:** Como desenvolvedor, eu quero validar o funcionamento do envio de emails através de testes práticos colaborativos, para que possamos identificar e resolver problemas de forma eficiente.

#### Acceptance Criteria

1. WHEN a implementação estiver concluída THEN o Sistema SHALL estar pronto para testes manuais de envio de email
2. WHEN erros ocorrerem durante testes THEN o Sistema SHALL fornecer logs detalhados para análise incluindo stack trace e configurações
3. WHEN problemas forem identificados THEN o Sistema SHALL permitir análise ampla incluindo frontend, backend e banco de dados PostgreSQL
4. WHEN o teste de recuperação de senha for executado THEN o Sistema SHALL registrar todas as etapas do fluxo nos logs para rastreamento
5. WHEN o email for enviado com sucesso THEN o Sistema SHALL confirmar no log com timestamp e destinatário
