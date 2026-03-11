# Design Document - User Profile Fixes

## Overview

Este documento descreve o design técnico para corrigir três inconsistências críticas no sistema Agenda JIBCA:

1. **Bug de salvamento de telefone**: O campo telefone não está sendo persistido corretamente quando atualizado sozinho
2. **Bug de cadastro de função**: O sistema sempre cria usuários como 'member', ignorando o valor de 'role' enviado pelo frontend
3. **Implementação de upload de foto de perfil**: Adicionar funcionalidade completa de upload, armazenamento e exibição de fotos de perfil

## Architecture

### Current Architecture

O sistema segue uma arquitetura em camadas:

```
Frontend (React) → API Routes → Controllers → Repositories → Database (PostgreSQL)
```

### Components Affected

**Backend:**
- `ProfileController.js` - Lógica de atualização de perfil do usuário logado
- `UserController.js` - Lógica de criação e gerenciamento de usuários (apenas líderes)
- `UserRepository.js` - Acesso a dados de usuários
- `profile.js` (routes) - Rotas de perfil
- `users.js` (routes) - Rotas de gerenciamento de usuários

**Frontend:**
- `ProfilePage.jsx` - Página de perfil do usuário logado
- `MemberForm.jsx` - Formulário de criação/edição de membros
- `userService.js` - Serviço de comunicação com API de usuários

**Database:**
- Tabela `users` - Já possui campo `avatar_url` (TEXT, nullable)

### New Components Required

**Backend:**
- `UploadService.js` - Serviço para processar uploads de imagens
- `ImageProcessor.js` - Utilitário para redimensionar e otimizar imagens
- Middleware `multer` - Para processar multipart/form-data
- Diretório `uploads/avatars/` - Armazenamento local de imagens

**Frontend:**
- `AvatarUpload.jsx` - Componente reutilizável para upload de avatar
- Lógica de preview de imagem antes do upload

## Components and Interfaces

### Backend Services

#### UploadService

```javascript
class UploadService {
  /**
   * Processa upload de avatar
   * @param {Object} file - Arquivo enviado via multer
   * @param {number} userId - ID do usuário
   * @returns {string} URL do avatar salvo
   */
  static async uploadAvatar(file, userId)
  
  /**
   * Remove avatar antigo do usuário
   * @param {string} avatarUrl - URL do avatar a ser removido
   */
  static async deleteAvatar(avatarUrl)
  
  /**
   * Valida arquivo de imagem
   * @param {Object} file - Arquivo a ser validado
   * @returns {boolean} True se válido
   */
  static validateImageFile(file)
}
```

#### ImageProcessor

```javascript
class ImageProcessor {
  /**
   * Redimensiona imagem para dimensões especificadas
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {number} width - Largura desejada
   * @param {number} height - Altura desejada
   * @returns {Buffer} Buffer da imagem redimensionada
   */
  static async resize(imageBuffer, width, height)
  
  /**
   * Otimiza qualidade da imagem
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @returns {Buffer} Buffer da imagem otimizada
   */
  static async optimize(imageBuffer)
}
```

### API Endpoints

#### New Endpoints

```
POST   /api/v1/profile/avatar        - Upload de avatar (usuário logado)
DELETE /api/v1/profile/avatar        - Remove avatar (usuário logado)
```

#### Modified Endpoints

```
PUT    /api/v1/profile               - Corrigir validação de telefone
POST   /api/v1/users                 - Corrigir uso do campo 'role'
PUT    /api/v1/users/:id             - Corrigir uso do campo 'role'
```

## Data Models

### User Model (Existing)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos relevantes:**
- `phone` - Campo opcional que deve aceitar NULL
- `role` - Deve aceitar 'leader' ou 'member'
- `avatar_url` - Armazenará caminho relativo da imagem (ex: '/uploads/avatars/user-123-1234567890.jpg')

### File Storage Structure

```
app/backend/
  uploads/
    avatars/
      user-{userId}-{timestamp}.{ext}
```

Exemplo: `user-5-1710345678901.jpg`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

#### Requirement 1 - Phone Update

1.1. WHEN um usuário atualiza apenas o campo telefone (sem alterar o nome) THEN o sistema SHALL salvar o telefone no banco de dados e retornar os dados atualizados
Thoughts: Este é um teste de que a validação não deve rejeitar atualizações que contenham apenas telefone. Podemos gerar usuários aleatórios, atualizar apenas o telefone, e verificar que o banco de dados contém o novo valor.
Testable: yes - property

1.2. WHEN um usuário remove o telefone (deixando o campo vazio) THEN o sistema SHALL salvar o valor NULL no banco de dados
Thoughts: Este é um caso específico de remoção de telefone. É um edge case importante.
Testable: edge-case

1.3. WHEN um usuário faz logout e login novamente após atualizar o telefone THEN o sistema SHALL exibir o telefone atualizado no perfil
Thoughts: Este é um teste de persistência. Podemos criar um usuário, atualizar o telefone, simular logout/login (buscar do banco), e verificar que o telefone persiste.
Testable: yes - property

1.4. WHEN um usuário atualiza o telefone com formato inválido THEN o sistema SHALL rejeitar a atualização e exibir mensagem de erro clara
Thoughts: Este é um teste de validação de entrada. Podemos gerar strings aleatórias inválidas e verificar que todas são rejeitadas.
Testable: yes - property

1.5. WHEN um usuário atualiza nome e telefone simultaneamente THEN o sistema SHALL salvar ambos os campos corretamente
Thoughts: Este é um teste de que múltiplos campos podem ser atualizados juntos. Podemos gerar valores aleatórios para ambos e verificar que ambos são salvos.
Testable: yes - property

#### Requirement 2 - Role Assignment

2.1. WHEN um líder cria um novo usuário selecionando a função "Líder" THEN o sistema SHALL criar o usuário com role='leader' no banco de dados
Thoughts: Este é um teste de que o valor enviado é respeitado. Podemos criar usuários com role='leader' e verificar que o banco contém 'leader'.
Testable: yes - property

2.2. WHEN um líder cria um novo usuário selecionando a função "Membro" THEN o sistema SHALL criar o usuário com role='member' no banco de dados
Thoughts: Similar ao anterior, mas para 'member'.
Testable: yes - property

2.3. WHEN um líder edita um usuário existente e altera a função THEN o sistema SHALL atualizar o campo role no banco de dados
Thoughts: Teste de atualização de role. Podemos criar usuário com uma role, atualizar para outra, e verificar a mudança.
Testable: yes - property

2.4. WHEN um usuário criado como líder faz login THEN o sistema SHALL conceder permissões de líder
Thoughts: Este é um teste de integração com o sistema de autenticação. Podemos verificar que o token JWT contém role='leader'.
Testable: yes - example

2.5. WHEN um usuário criado como membro faz login THEN o sistema SHALL conceder apenas permissões de membro
Thoughts: Similar ao anterior, mas para member.
Testable: yes - example

#### Requirement 3 - Avatar Upload

3.1. WHEN um usuário clica no botão de câmera no seu próprio perfil THEN o sistema SHALL abrir um seletor de arquivos
Thoughts: Este é um teste de UI que não pode ser testado automaticamente de forma significativa.
Testable: no

3.2. WHEN um usuário seleciona uma imagem válida (JPG, PNG, GIF) THEN o sistema SHALL fazer upload e atualizar avatar_url
Thoughts: Podemos gerar arquivos de imagem válidos aleatórios, fazer upload, e verificar que avatar_url foi atualizado.
Testable: yes - property

3.3. WHEN um usuário faz upload de uma imagem muito grande (>5MB) THEN o sistema SHALL rejeitar o upload
Thoughts: Este é um edge case específico de validação de tamanho.
Testable: edge-case

3.4. WHEN um usuário faz upload de um arquivo que não é imagem THEN o sistema SHALL rejeitar o upload
Thoughts: Podemos gerar arquivos não-imagem e verificar que todos são rejeitados.
Testable: yes - property

3.5. WHEN o upload é concluído com sucesso THEN o sistema SHALL exibir a nova foto imediatamente
Thoughts: Este é um teste de UI/integração que verifica o fluxo completo.
Testable: yes - example

3.6. WHEN um usuário não possui foto de perfil THEN o sistema SHALL exibir as iniciais do nome
Thoughts: Este é um teste de renderização de fallback.
Testable: yes - example

3.7. WHEN uma imagem é enviada THEN o sistema SHALL redimensionar para 400x400px
Thoughts: Podemos enviar imagens de tamanhos variados e verificar que todas resultam em 400x400px.
Testable: yes - property

3.8. WHEN um usuário tenta fazer upload para perfil de outro usuário THEN o sistema SHALL rejeitar com erro de permissão
Thoughts: Teste de autorização. Podemos tentar fazer upload para outro userId e verificar rejeição.
Testable: yes - property

3.9. WHEN um usuário remove sua foto de perfil THEN o sistema SHALL definir avatar_url como NULL
Thoughts: Teste de remoção. Podemos criar usuário com avatar, remover, e verificar que avatar_url é NULL.
Testable: yes - property

#### Requirement 4 - Data Integrity

4.1. WHEN o backend recebe dados de atualização de perfil THEN o sistema SHALL validar todos os campos
Thoughts: Este é um objetivo geral, não um teste específico.
Testable: no

4.2. WHEN ocorre um erro durante atualização THEN o sistema SHALL reverter todas as alterações
Thoughts: Este é um teste de transação atômica. Podemos simular erro e verificar rollback.
Testable: yes - example

4.3. WHEN o frontend envia dados de criação THEN o sistema SHALL incluir todos os campos obrigatórios
Thoughts: Este é um teste de validação de entrada.
Testable: yes - example

4.4. WHEN o backend processa criação THEN o sistema SHALL utilizar valores enviados sem sobrescrever
Thoughts: Este é exatamente o bug que estamos corrigindo. Podemos verificar que valores enviados são preservados.
Testable: yes - property

4.5. WHEN um usuário é criado ou atualizado THEN o sistema SHALL retornar dados completos e atualizados
Thoughts: Round trip property - enviar dados, receber resposta, verificar que correspondem.
Testable: yes - property

#### Requirement 5 - User Feedback

5.1-5.5: Todos são testes de UI/UX sobre mensagens exibidas
Thoughts: Estes são testes de integração/E2E, não properties automatizadas.
Testable: no

### Property Reflection

Analisando as properties identificadas:

**Redundâncias identificadas:**
- Properties 1.1, 1.3, e 1.5 todas testam persistência de telefone. Podemos consolidar em uma property abrangente.
- Properties 2.1 e 2.2 testam a mesma coisa (respeitar role enviado), apenas com valores diferentes.
- Properties 3.2, 3.7, e 3.9 podem ser consolidadas em um teste de ciclo completo de avatar.

**Properties consolidadas:**

Property 1: Phone field persistence
Property 2: Invalid phone rejection  
Property 3: Role assignment preservation
Property 4: Avatar upload and storage
Property 5: Invalid file rejection
Property 6: Avatar resize to standard dimensions
Property 7: Authorization for avatar operations
Property 8: Data integrity in updates


### Correctness Properties

Property 1: Phone field persistence
*For any* user and any valid phone value (including NULL), when updating the phone field, the value stored in the database should match the value sent in the update request
**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

Property 2: Invalid phone rejection
*For any* string that doesn't match the phone validation pattern (10-11 digits), the system should reject the update and return a validation error
**Validates: Requirements 1.4**

Property 3: Role assignment preservation
*For any* user creation or update request that includes a role field with value 'leader' or 'member', the role stored in the database should exactly match the role sent in the request
**Validates: Requirements 2.1, 2.2, 2.3, 4.4**

Property 4: Avatar upload and storage
*For any* valid image file (JPG, PNG, GIF) under 5MB, when uploaded by the authenticated user for their own profile, the system should store the file and update avatar_url to point to the stored location
**Validates: Requirements 3.2, 3.5**

Property 5: Invalid file rejection
*For any* file that is not a valid image format or exceeds 5MB, the system should reject the upload and return an appropriate error message
**Validates: Requirements 3.3, 3.4**

Property 6: Avatar resize to standard dimensions
*For any* uploaded image regardless of original dimensions, the stored image should be exactly 400x400 pixels
**Validates: Requirements 3.7**

Property 7: Authorization for avatar operations
*For any* user attempting to upload or delete an avatar for a different user's profile, the system should reject the operation with a 403 Forbidden error
**Validates: Requirements 3.8**

Property 8: Data integrity in updates
*For any* user update operation, if all fields are valid, the response should contain all updated fields with their new values matching what was sent
**Validates: Requirements 4.5**

## Error Handling

### Backend Error Codes

```javascript
// Profile update errors
VALIDATION_ERROR          - Dados inválidos (400)
NO_FIELDS_TO_UPDATE      - Nenhum campo para atualizar (400)
UPDATE_FAILED            - Falha ao atualizar no banco (500)

// User creation errors  
EMAIL_EXISTS             - Email já cadastrado (409)
CREATE_USER_ERROR        - Erro ao criar usuário (500)

// Avatar upload errors
INVALID_FILE_TYPE        - Tipo de arquivo inválido (400)
FILE_TOO_LARGE          - Arquivo excede 5MB (400)
UPLOAD_FAILED           - Falha no upload (500)
UNAUTHORIZED_AVATAR     - Tentativa de upload para outro usuário (403)
```

### Frontend Error Handling

- Exibir mensagens de erro específicas usando `toastManager`
- Validação client-side antes de enviar requisição
- Indicadores de loading durante operações assíncronas
- Rollback de UI em caso de erro (manter valores anteriores)

## Testing Strategy

Os testes serão realizados manualmente após a implementação. Os seguintes cenários devem ser testados:

### Manual Test Scenarios

**Teste 1: Atualização de Telefone**
1. Login no sistema
2. Ir para página de perfil
3. Editar apenas o campo telefone (deixar nome inalterado)
4. Salvar
5. Fazer logout e login novamente
6. Verificar que o telefone foi salvo corretamente

**Teste 2: Remoção de Telefone**
1. Login no sistema com usuário que tem telefone
2. Ir para página de perfil
3. Limpar o campo telefone (deixar vazio)
4. Salvar
5. Verificar que o telefone foi removido

**Teste 3: Cadastro de Líder**
1. Login como líder
2. Ir para página de membros
3. Criar novo membro selecionando função "Líder"
4. Verificar que o usuário foi criado como líder
5. Fazer login com o novo usuário
6. Verificar que tem permissões de líder

**Teste 4: Cadastro de Membro**
1. Login como líder
2. Criar novo membro selecionando função "Membro"
3. Verificar que o usuário foi criado como membro
4. Fazer login com o novo usuário
5. Verificar que tem apenas permissões de membro

**Teste 5: Upload de Avatar**
1. Login no sistema
2. Ir para página de perfil
3. Clicar no botão de câmera
4. Selecionar uma imagem válida (JPG, PNG ou GIF)
5. Verificar que a imagem aparece imediatamente
6. Fazer logout e login
7. Verificar que a imagem persiste

**Teste 6: Validação de Arquivo Inválido**
1. Tentar fazer upload de arquivo não-imagem (ex: PDF)
2. Verificar mensagem de erro apropriada
3. Tentar fazer upload de imagem muito grande (>5MB)
4. Verificar mensagem de erro apropriada

**Teste 7: Remoção de Avatar**
1. Login com usuário que tem avatar
2. Remover avatar
3. Verificar que as iniciais aparecem novamente

**Teste 8: Validação de Telefone Inválido**
1. Tentar atualizar telefone com formato inválido
2. Verificar mensagem de erro apropriada

## Implementation Notes

### Bug Fix 1: Phone Update Validation

**Root Cause:** 
In `ProfileController.updateProfile()`, the validation logic checks:
```javascript
if (!name && phone === undefined)
```

This fails when user sends `name: ""` (empty string) and `phone: "123456789"`.

**Solution:**
Change validation to:
```javascript
if (!name?.trim() && phone === undefined)
```

### Bug Fix 2: Role Assignment

**Root Cause:**
In `UserController.create()`, line 31 hardcodes:
```javascript
role: 'member', // Sempre criar como membro
```

**Solution:**
Change to:
```javascript
role: req.body.role || 'member', // Usar role enviado ou 'member' como padrão
```

Add validation to ensure role is either 'leader' or 'member'.

### Avatar Upload Implementation

**Libraries needed:**
- `multer` - For handling multipart/form-data (already common in Node.js)
- `sharp` - For image processing and resizing

**Storage strategy:**
- Local filesystem storage in `uploads/avatars/`
- Filename format: `user-{userId}-{timestamp}.{ext}`
- Serve static files via Express: `app.use('/uploads', express.static('uploads'))`

**Security considerations:**
- Validate file MIME type
- Limit file size to 5MB
- Sanitize filenames
- Check user authorization (only own profile)
- Store files outside web root if possible

## Dependencies

### New NPM Packages

```json
{
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0"
}
```

### Existing Dependencies (No Changes)

- express-validator (for validation)
- bcrypt (for passwords)
- jsonwebtoken (for auth)
- pg (for database)
