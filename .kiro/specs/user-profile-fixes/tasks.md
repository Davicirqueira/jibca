# Implementation Plan - User Profile Fixes

- [x] 1. Fix phone update validation bug in ProfileController






  - Corrigir a validação que impede atualização de telefone sozinho
  - Modificar `ProfileController.updateProfile()` para aceitar atualização apenas de telefone
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Fix role assignment bug in UserController






  - Corrigir o hardcoded `role: 'member'` para respeitar o valor enviado
  - Adicionar validação para garantir que role seja 'leader' ou 'member'
  - Modificar `UserController.create()` e `UserController.update()`
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Install and configure dependencies for avatar upload


  - Instalar pacotes `multer` e `sharp`
  - Criar diretório `uploads/avatars/` para armazenamento
  - Configurar Express para servir arquivos estáticos de `/uploads`
  - _Requirements: 3.1, 3.2_

- [x] 4. Create ImageProcessor utility


  - [x] 4.1 Implement image resize function


    - Criar função para redimensionar imagens para 400x400px
    - Usar biblioteca `sharp` para processamento
    - _Requirements: 3.7_
  
  - [x] 4.2 Implement image optimization function

    - Criar função para otimizar qualidade da imagem
    - Reduzir tamanho do arquivo mantendo qualidade visual
    - _Requirements: 3.2_

- [x] 5. Create UploadService for avatar management


  - [x] 5.1 Implement file validation


    - Validar tipo de arquivo (JPG, PNG, GIF)
    - Validar tamanho máximo (5MB)
    - _Requirements: 3.3, 3.4_
  
  - [x] 5.2 Implement avatar upload function

    - Processar upload de arquivo
    - Redimensionar imagem usando ImageProcessor
    - Salvar arquivo com nome único (user-{userId}-{timestamp}.{ext})
    - Retornar URL do avatar salvo
    - _Requirements: 3.2, 3.5_
  
  - [x] 5.3 Implement avatar deletion function

    - Remover arquivo físico do sistema
    - Atualizar avatar_url para NULL no banco
    - _Requirements: 3.9_

- [x] 6. Configure multer middleware


  - Configurar multer para processar multipart/form-data
  - Definir limites de tamanho de arquivo
  - Configurar filtro de tipos de arquivo permitidos
  - _Requirements: 3.1, 3.2_

- [x] 7. Add avatar upload endpoints to ProfileController


  - [x] 7.1 Create POST /api/v1/profile/avatar endpoint


    - Receber arquivo via multer
    - Validar que usuário está fazendo upload para próprio perfil
    - Chamar UploadService para processar upload
    - Atualizar avatar_url no banco de dados
    - Retornar URL do novo avatar
    - _Requirements: 3.2, 3.5, 3.8_
  
  - [x] 7.2 Create DELETE /api/v1/profile/avatar endpoint

    - Validar que usuário está removendo próprio avatar
    - Chamar UploadService para deletar arquivo
    - Atualizar avatar_url para NULL no banco
    - _Requirements: 3.9_

- [x] 8. Update profile routes


  - Adicionar rotas de avatar ao arquivo `profile.js`
  - Aplicar middleware de autenticação
  - Aplicar middleware multer para upload
  - _Requirements: 3.1, 3.2_

- [x] 9. Create AvatarUpload component (Frontend)


  - [x] 9.1 Create reusable avatar upload component


    - Criar componente React para seleção de arquivo
    - Implementar preview de imagem antes do upload
    - Adicionar validação client-side (tipo e tamanho)
    - Exibir indicador de loading durante upload
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 9.2 Implement avatar display logic

    - Exibir imagem se avatar_url existe
    - Exibir iniciais do nome se avatar_url é NULL
    - Aplicar estilos consistentes
    - _Requirements: 3.6_

- [x] 10. Update ProfilePage to support avatar upload





  - Integrar componente AvatarUpload
  - Conectar botão de câmera ao seletor de arquivos
  - Implementar chamadas à API de upload/delete
  - Atualizar contexto de autenticação com novo avatar_url
  - Exibir mensagens de sucesso/erro
  - _Requirements: 3.1, 3.2, 3.5, 3.9_

- [x] 11. Update userService with avatar methods


  - Adicionar método `uploadAvatar(file)`
  - Adicionar método `deleteAvatar()`
  - Configurar headers para multipart/form-data
  - _Requirements: 3.2, 3.9_

- [x] 12. Add error handling and user feedback



  - Implementar tratamento de erros específicos para cada operação
  - Adicionar mensagens de toast para sucesso/erro
  - Validar entradas antes de enviar requisições
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Checkpoint - Teste manual completo


  - Executar todos os 8 cenários de teste manual descritos no design
  - Verificar que telefone é salvo corretamente
  - Verificar que role é respeitado na criação de usuários
  - Verificar que avatar upload funciona end-to-end
  - Verificar validações de arquivo
  - Verificar autorização (usuário só pode alterar próprio perfil)
  - Documentar quaisquer problemas encontrados
