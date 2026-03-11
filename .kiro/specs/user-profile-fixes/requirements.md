# Requirements Document

## Introduction

Este documento especifica as correções necessárias para três inconsistências críticas identificadas no sistema Agenda JIBCA relacionadas ao gerenciamento de perfis de usuários e cadastro de membros. As correções garantirão que o sistema funcione conforme esperado pelos usuários, permitindo a persistência correta de dados de telefone, o cadastro adequado de funções de usuário (líder/membro), e estabelecerão a base para futura implementação de upload de fotos de perfil.

## Glossary

- **Sistema**: Agenda JIBCA - Sistema de gestão de membros e eventos da igreja
- **Usuário**: Pessoa autenticada no sistema (pode ser líder ou membro)
- **Líder**: Usuário com permissões administrativas para gerenciar membros e eventos
- **Membro**: Usuário com permissões básicas para visualizar eventos e confirmar presença
- **Perfil**: Conjunto de informações pessoais do usuário (nome, email, telefone, foto)
- **Telefone**: Número de telefone do usuário (campo opcional)
- **Função**: Role do usuário no sistema (leader ou member)
- **Avatar**: Imagem de perfil do usuário
- **Backend**: Servidor Node.js/Express que processa as requisições
- **Frontend**: Interface React que os usuários interagem
- **Repository**: Camada de acesso a dados que interage com o banco PostgreSQL
- **Controller**: Camada que processa requisições HTTP e coordena a lógica de negócio

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero atualizar meu número de telefone no meu perfil, para que essa informação seja salva corretamente e persista quando eu fizer logout e login novamente.

#### Acceptance Criteria

1. WHEN um usuário atualiza apenas o campo telefone (sem alterar o nome) THEN o sistema SHALL salvar o telefone no banco de dados e retornar os dados atualizados
2. WHEN um usuário remove o telefone (deixando o campo vazio) THEN o sistema SHALL salvar o valor NULL no banco de dados
3. WHEN um usuário faz logout e login novamente após atualizar o telefone THEN o sistema SHALL exibir o telefone atualizado no perfil
4. WHEN um usuário atualiza o telefone com formato inválido THEN o sistema SHALL rejeitar a atualização e exibir mensagem de erro clara
5. WHEN um usuário atualiza nome e telefone simultaneamente THEN o sistema SHALL salvar ambos os campos corretamente

### Requirement 2

**User Story:** Como um líder do sistema, eu quero cadastrar novos membros com a função correta (líder ou membro), para que o sistema respeite as permissões adequadas para cada usuário.

#### Acceptance Criteria

1. WHEN um líder cria um novo usuário selecionando a função "Líder" THEN o sistema SHALL criar o usuário com role='leader' no banco de dados
2. WHEN um líder cria um novo usuário selecionando a função "Membro" THEN o sistema SHALL criar o usuário com role='member' no banco de dados
3. WHEN um líder edita um usuário existente e altera a função THEN o sistema SHALL atualizar o campo role no banco de dados
4. WHEN um usuário criado como líder faz login THEN o sistema SHALL conceder permissões de líder (acesso a gestão de membros e eventos)
5. WHEN um usuário criado como membro faz login THEN o sistema SHALL conceder apenas permissões de membro (visualização de eventos)

### Requirement 3

**User Story:** Como usuário do sistema (líder ou membro), eu quero fazer upload de uma foto de perfil, para que eu possa personalizar minha identidade visual no sistema.

#### Acceptance Criteria

1. WHEN um usuário clica no botão de câmera no seu próprio perfil THEN o sistema SHALL abrir um seletor de arquivos para escolher uma imagem
2. WHEN um usuário seleciona uma imagem válida (JPG, PNG, GIF) THEN o sistema SHALL fazer upload da imagem e atualizar o avatar_url no banco de dados
3. WHEN um usuário faz upload de uma imagem muito grande (>5MB) THEN o sistema SHALL rejeitar o upload e exibir mensagem de erro
4. WHEN um usuário faz upload de um arquivo que não é imagem THEN o sistema SHALL rejeitar o upload e exibir mensagem de erro
5. WHEN o upload é concluído com sucesso THEN o sistema SHALL exibir a nova foto de perfil imediatamente
6. WHEN um usuário não possui foto de perfil THEN o sistema SHALL exibir as iniciais do nome como placeholder
7. WHEN uma imagem é enviada THEN o sistema SHALL redimensionar a imagem para dimensões adequadas (ex: 400x400px) antes de armazenar
8. WHEN um usuário tenta fazer upload de foto para o perfil de outro usuário THEN o sistema SHALL rejeitar a operação com erro de permissão
9. WHEN um usuário remove sua foto de perfil THEN o sistema SHALL definir avatar_url como NULL e exibir as iniciais novamente

### Requirement 4

**User Story:** Como desenvolvedor do sistema, eu quero garantir a integridade dos dados de usuário, para que todas as operações de criação e atualização sejam consistentes e confiáveis.

#### Acceptance Criteria

1. WHEN o backend recebe dados de atualização de perfil THEN o sistema SHALL validar todos os campos antes de persistir no banco de dados
2. WHEN ocorre um erro durante a atualização de perfil THEN o sistema SHALL reverter todas as alterações (transação atômica)
3. WHEN o frontend envia dados de criação de usuário THEN o sistema SHALL incluir todos os campos obrigatórios na requisição
4. WHEN o backend processa criação de usuário THEN o sistema SHALL utilizar os valores enviados pelo frontend sem sobrescrever com valores hardcoded
5. WHEN um usuário é criado ou atualizado THEN o sistema SHALL retornar os dados completos e atualizados para o frontend

### Requirement 5

**User Story:** Como usuário do sistema, eu quero receber feedback claro sobre o sucesso ou falha das minhas ações, para que eu saiba se minhas alterações foram salvas corretamente.

#### Acceptance Criteria

1. WHEN um usuário atualiza seu perfil com sucesso THEN o sistema SHALL exibir uma mensagem de confirmação clara
2. WHEN ocorre um erro ao atualizar o perfil THEN o sistema SHALL exibir uma mensagem de erro específica indicando o problema
3. WHEN um líder cria um novo membro com sucesso THEN o sistema SHALL exibir mensagem confirmando a criação e a função atribuída
4. WHEN um líder tenta criar um usuário com email duplicado THEN o sistema SHALL exibir mensagem de erro específica sobre email já existente
5. WHEN o sistema está processando uma requisição THEN o sistema SHALL exibir indicador de carregamento para o usuário
