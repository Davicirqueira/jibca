# Design Document

## Overview

Este documento detalha o design técnico para ativar o sistema de recuperação de senha por email na Agenda JIBCA. A solução aproveita 90% da infraestrutura já existente, necessitando apenas ativar o envio de emails via Gmail SMTP e melhorar os templates com a identidade visual da JIBCA.

## Architecture

### High-Level Flow

```
[Membro] → [Frontend: /forgot-password] → [Backend: POST /api/v1/auth/forgot-password]
                                                ↓
                                    [AuthService.generateResetToken()]
                                                ↓
                                    [PasswordResetRepository.create()]
                                                ↓
                                    [EmailService.sendPasswordResetEmail()] ← ATIVAR AQUI
                                                ↓
                                    [Gmail SMTP] → [Email do Membro]
                                                ↓
[Membro] ← [Email com Link] → [Frontend: /reset-password?token=xxx]
                                                ↓
                                    [Backend: POST /api/v1/auth/reset-password]
                                                ↓
                                    [AuthService.resetPassword()]
                                                ↓
                                    [Senha Atualizada] ✅
```

### Components Involved

**Frontend:**
- `pages/ForgotPassword.jsx` - Interface de solicitação (✅ já existe)
- `pages/ResetPassword.jsx` - Interface de redefinição (✅ já existe)
- `services/authService.js` - Chamadas à API (✅ já existe)

**Backend:**
- `controllers/AuthController.js` - Endpoints (✅ já existe)
- `services/AuthService.js` - Lógica de negócio (✅ já existe)
- `services/EmailService.js` - Envio de emails (⚠️ precisa ativar)
- `repositories/PasswordResetRepository.js` - Acesso a dados (✅ já existe)

**Database:**
- `password_reset_tokens` table (✅ já existe)

**External:**
- Gmail SMTP (✅ já configurado)

## Components and Interfaces

### EmailService.js

**Localização:** `app/backend/src/services/EmailService.js`

**Mudanças Necessárias:**

1. **Ativar transporter do Nodemailer**
2. **Melhorar template HTML com identidade JIBCA**
3. **Adicionar logs detalhados**

**Interface Atual:**
```javascript
class EmailService {
  async sendPasswordResetEmail(email, token, userName)
}
```

**Comportamento Atual:**
- Apenas loga no console
- Não envia email real
- Retorna `{ success: false, reason: 'not_configured' }`

**Comportamento Desejado:**
- Conecta com Gmail SMTP
- Envia email HTML formatado
- Retorna `{ success: true, messageId: '...' }`
- Loga erros detalhados

### AuthController.js

**Localização:** `app/backend/src/controllers/AuthController.js`

**Método:** `forgotPassword()`

**Mudanças Necessárias:**
- Atualizar notificação aos líderes para incluir status do envio de email
- Melhorar mensagens de log

**Fluxo Atual:**
1. Valida email
2. Gera token
3. Notifica líderes (sem mencionar email)
4. Retorna sucesso genérico

**Fluxo Desejado:**
1. Valida email
2. Gera token
3. **Envia email** ← NOVO
4. Notifica líderes (incluindo status do envio)
5. Retorna sucesso genérico

## Data Models

### password_reset_tokens (já existe)

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_password_reset_token` ON token
- `idx_password_reset_user_id` ON user_id
- `idx_password_reset_expires` ON expires_at
- `idx_password_reset_used` ON used

**Nenhuma mudança necessária no modelo de dados.**

## Email Template Design

### Identidade Visual JIBCA

**Cores Oficiais:**
- **Primária (Fundo)**: `#3D1F1F` (Marrom/Vinho escuro)
- **Secundária (Logo)**: `#C0C0C0` (Cinza claro/Prata)
- **Texto Principal**: `#FFFFFF` (Branco)
- **Texto Secundário**: `#E0E0E0` (Cinza claro)
- **Botão CTA**: `#8B0000` (Vermelho escuro - cor atual do sistema)
- **Botão Hover**: `#A52A2A` (Vermelho mais claro)

**Elementos Visuais:**
- Logo do Leão com Coroa
- Referência: 1 Timóteo 4:12
- Tipografia limpa e legível

### Template HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - JIBCA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  
  <!-- Container Principal -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Card do Email -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" 
               style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header com Identidade JIBCA -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #3D1F1F 0%, #2A1515 100%); 
                                       padding: 40px 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #C0C0C0; margin: 0; font-size: 28px; font-weight: bold;">
                🦁 JIBCA
              </h1>
              <p style="color: #E0E0E0; margin: 10px 0 0 0; font-size: 14px; font-style: italic;">
                1 Timóteo 4:12
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                Recuperação de Senha
              </h2>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>{{userName}}</strong>,
              </p>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta na Agenda JIBCA. 
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{resetUrl}}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #8B0000; 
                              color: #ffffff; text-decoration: none; border-radius: 8px; 
                              font-weight: bold; font-size: 16px;">
                      Redefinir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Informações Adicionais -->
              <div style="background-color: #FFF9E6; border-left: 4px solid #F59E0B; 
                          padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="color: #92400E; margin: 0; font-size: 14px; line-height: 1.5;">
                  <strong>⏰ Atenção:</strong> Este link é válido por <strong>60 minutos</strong>. 
                  Após esse período, você precisará solicitar um novo link.
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
                Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
              </p>
              
              <p style="background-color: #F3F4F6; padding: 12px; border-radius: 6px; 
                        word-break: break-all; font-size: 12px; color: #4B5563; margin: 0 0 30px 0;">
                {{resetUrl}}
              </p>
              
              <p style="color: #999999; line-height: 1.6; margin: 0; font-size: 13px;">
                Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; border-radius: 0 0 12px 12px; 
                       text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Juventude JIBCA</strong>
              </p>
              <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
                Igreja Batista Central de Americana
              </p>
              <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
```

### Template Variables

- `{{userName}}` - Nome do membro
- `{{resetUrl}}` - URL completa com token

### Email Subject

```
Recuperação de Senha - Agenda JIBCA
```

## Error Handling

### Cenários de Erro

**1. Configuração Inválida**
```javascript
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ Email não configurado. Verifique EMAIL_USER e EMAIL_PASSWORD no .env');
  return { success: false, reason: 'not_configured' };
}
```

**2. Falha na Conexão SMTP**
```javascript
catch (error) {
  console.error('❌ Erro ao enviar email:', {
    destinatario: email,
    erro: error.message,
    codigo: error.code,
    comando: error.command
  });
  // Não revelar erro ao usuário
  return { success: false, reason: 'smtp_error' };
}
```

**3. Email Rejeitado**
```javascript
if (info.rejected.length > 0) {
  console.error('❌ Email rejeitado:', {
    destinatario: email,
    rejeitados: info.rejected
  });
  return { success: false, reason: 'rejected' };
}
```

**4. Timeout**
```javascript
// Configurar timeout de 30 segundos
transporter: {
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
}
```

### Logging Strategy

**Sucesso:**
```javascript
console.log('✅ Email de recuperação enviado:', {
  destinatario: email,
  usuario: userName,
  messageId: info.messageId,
  timestamp: new Date().toISOString()
});
```

**Desenvolvimento:**
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 URL de recuperação (DEV):', resetUrl);
  console.log('🔑 Token (DEV):', token);
}
```

## Testing Strategy

### Manual Testing Approach

**Fase 1: Validar Configuração**
1. Verificar variáveis no `.env`
2. Iniciar servidor backend
3. Verificar logs de inicialização

**Fase 2: Teste de Envio**
1. Acessar `/forgot-password` no frontend
2. Inserir email válido cadastrado
3. Submeter formulário
4. Monitorar logs do backend
5. Verificar recebimento do email

**Fase 3: Teste de Link**
1. Abrir email recebido
2. Clicar no botão "Redefinir Minha Senha"
3. Verificar redirecionamento para `/reset-password?token=...`
4. Validar que token é aceito

**Fase 4: Teste de Redefinição**
1. Inserir nova senha
2. Confirmar senha
3. Submeter formulário
4. Verificar sucesso
5. Testar login com nova senha

**Fase 5: Testes de Erro**
1. Testar com email não cadastrado (deve retornar mensagem genérica)
2. Testar com token expirado (após 60 min)
3. Testar com token já usado
4. Testar rate limiting (3 solicitações em 1 hora)

### Troubleshooting Checklist

**Se email não chegar:**
- [ ] Verificar pasta de spam
- [ ] Verificar logs do backend para erros
- [ ] Validar EMAIL_USER e EMAIL_PASSWORD no `.env`
- [ ] Testar conexão SMTP manualmente
- [ ] Verificar se App Password está correta
- [ ] Verificar se 2FA está ativado no Gmail

**Se link não funcionar:**
- [ ] Verificar se FRONTEND_URL está correto no `.env`
- [ ] Verificar se token está na URL
- [ ] Verificar logs de validação do token
- [ ] Verificar se token não expirou
- [ ] Verificar tabela `password_reset_tokens` no PostgreSQL

**Se redefinição falhar:**
- [ ] Verificar validação de senha no frontend
- [ ] Verificar logs do backend
- [ ] Verificar se token foi marcado como usado
- [ ] Verificar se senha foi atualizada no banco

## Implementation Notes

### Files to Modify

1. **`app/backend/src/services/EmailService.js`**
   - Ativar transporter do Nodemailer
   - Implementar template HTML
   - Adicionar logs detalhados

2. **`app/backend/src/controllers/AuthController.js`**
   - Atualizar notificação aos líderes
   - Incluir status do envio de email

### Files Already Complete

- ✅ `app/backend/.env` - Configurações prontas
- ✅ `app/backend/src/services/AuthService.js` - Lógica completa
- ✅ `app/backend/src/repositories/PasswordResetRepository.js` - CRUD completo
- ✅ `app/frontend/src/pages/ForgotPassword.jsx` - Interface pronta
- ✅ `app/frontend/src/pages/ResetPassword.jsx` - Interface pronta
- ✅ `app/backend/migrations/003_password_reset_tokens.sql` - Tabela criada

### Dependencies

**Já Instaladas:**
- ✅ `nodemailer@^8.0.0`
- ✅ `dotenv@^16.3.1`

**Nenhuma nova dependência necessária.**

## Security Considerations

1. **Token Seguro**: 64 caracteres hex (praticamente impossível de adivinhar)
2. **Expiração**: 60 minutos (balanceamento entre segurança e UX)
3. **Rate Limiting**: 3 solicitações por hora por IP+email
4. **Mensagem Genérica**: Não revela se email existe
5. **Token Único**: Invalidado após uso
6. **HTTPS**: Obrigatório em produção
7. **App Password**: Mais seguro que senha normal do Gmail
8. **Logs**: Não expõem senhas ou tokens completos

## Performance Considerations

1. **Envio Assíncrono**: Não bloqueia resposta ao usuário
2. **Timeout**: 30 segundos para evitar travamento
3. **Connection Pooling**: Nodemailer reutiliza conexões SMTP
4. **Template Caching**: Template HTML pode ser cacheado
5. **Índices no Banco**: Queries otimizadas com índices existentes

## Rollback Plan

Se houver problemas após deploy:

1. **Desativar envio de emails**:
   ```env
   EMAIL_USER=
   EMAIL_PASSWORD=
   ```

2. **Sistema volta ao comportamento anterior**:
   - Apenas notifica líderes
   - Não envia emails
   - Logs indicam "not_configured"

3. **Nenhum dado é perdido**:
   - Tokens continuam sendo gerados
   - Tabela permanece intacta
   - Frontend continua funcionando

## Future Enhancements

1. **Templates Dinâmicos**: Sistema de templates configurável
2. **Múltiplos Idiomas**: Suporte a PT/EN/ES
3. **Email de Confirmação**: Após redefinição bem-sucedida
4. **Analytics**: Rastrear taxa de abertura e cliques
5. **Retry Logic**: Tentar reenviar em caso de falha temporária
6. **Queue System**: Fila de emails para alto volume
7. **Logo no Email**: Incluir logo JIBCA como imagem inline
