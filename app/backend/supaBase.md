# 🔒 Guia de Implementação: Reset de Senha

Sistema completo de recuperação de senha para a Agenda JIBCA usando PostgreSQL + Node.js.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Testes](#testes)
7. [Segurança](#segurança)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Fluxo do Sistema

```
1. Usuário esquece senha
   ↓
2. Solicita reset (informa email)
   ↓
3. Sistema gera token único
   ↓
4. Email enviado com link + token
   ↓
5. Usuário clica no link
   ↓
6. Sistema valida token
   ↓
7. Usuário define nova senha
   ↓
8. Token é invalidado
   ↓
9. Senha atualizada ✅
```

### Recursos de Segurança

- ✅ Tokens únicos e aleatórios (32 bytes)
- ✅ Expiração automática (1 hora)
- ✅ Uso único (token invalidado após reset)
- ✅ Hash bcrypt para senhas
- ✅ Validação de requisitos de senha
- ✅ Rate limiting recomendado
- ✅ Não revela se email existe (segurança)

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install nodemailer
```

### 2. Executar Migration

```bash
# Tornar script executável
chmod +x run-password-reset-migration.js

# Executar migration
node run-password-reset-migration.js
```

### 3. Verificar Tabela Criada

```bash
# Conectar ao PostgreSQL
psql -U seu_usuario -d agenda_jibca

# Verificar tabela
\d password_reset_tokens

# Deve mostrar:
# - id (serial, primary key)
# - user_id (integer, foreign key)
# - token (varchar 255, unique)
# - expires_at (timestamp)
# - used (boolean)
# - created_at (timestamp)
# - used_at (timestamp)
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente (.env)

```bash
# URL do Frontend (para links de reset)
FRONTEND_URL=http://localhost:3000

# ===== OPÇÃO 1: Gmail (Desenvolvimento) =====
EMAIL_SERVICE=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password
EMAIL_FROM=Agenda JIBCA <seu-email@gmail.com>

# ===== OPÇÃO 2: SMTP Genérico =====
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.seuservidor.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=seu-usuario
# SMTP_PASSWORD=sua-senha
# EMAIL_FROM=noreply@seudominio.com

# ===== OPÇÃO 3: Mailtrap (Testes) =====
# MAILTRAP_USER=seu-usuario
# MAILTRAP_PASSWORD=sua-senha
# EMAIL_FROM=noreply@agenda-jibca.com
```

### 2. Configurar Gmail App Password

Se usar Gmail, siga estes passos:

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "App" → "Outro (nome personalizado)"
3. Digite: "Agenda JIBCA"
4. Copie a senha gerada (16 caracteres)
5. Use no `.env` como `EMAIL_PASSWORD`

### 3. Alternativas de Email

**Para Produção:**
- SendGrid (100 emails/dia grátis)
- Mailgun (5.000 emails/mês grátis)
- AWS SES (muito barato)
- Postmark (qualidade premium)

**Para Desenvolvimento:**
- Mailtrap (captura emails sem enviar)
- Console log (modo desenvolvimento)

---

## 🔧 Backend

### 1. Adicionar Service

Copie `passwordResetService.js` para `src/services/`:

```bash
cp passwordResetService.js src/services/
```

### 2. Adicionar Email Service

Copie `emailService.js` para `src/services/`:

```bash
cp emailService.js src/services/
```

### 3. Adicionar Rotas

Copie `passwordResetRoutes.js` para `src/routes/`:

```bash
cp passwordResetRoutes.js src/routes/
```

### 4. Registrar Rotas no Server

Edite `src/server.js` ou `src/app.js`:

```javascript
// Importar rotas
const passwordResetRoutes = require('./routes/passwordResetRoutes');

// Registrar rotas (APÓS outras rotas de autenticação)
app.use('/api/password-reset', passwordResetRoutes);
```

### 5. Estrutura Final

```
src/
├── services/
│   ├── passwordResetService.js  ← NOVO
│   └── emailService.js           ← NOVO
├── routes/
│   ├── authRoutes.js
│   └── passwordResetRoutes.js   ← NOVO
└── server.js                     ← ATUALIZAR
```

---

## 💻 Frontend

### 1. Criar Página "Esqueci a Senha"

```bash
# React Router
src/pages/ForgotPassword.jsx

# Next.js
pages/forgot-password.jsx
```

### 2. Criar Página "Redefinir Senha"

```bash
# React Router
src/pages/ResetPassword.jsx

# Next.js
pages/reset-password.jsx
```

### 3. Adicionar Link no Login

```jsx
// Na página de login
<form onSubmit={handleLogin}>
  {/* ... campos ... */}
  
  <div className="forgot-password-link">
    <a href="/forgot-password">Esqueceu a senha?</a>
  </div>
  
  <button type="submit">Entrar</button>
</form>
```

### 4. Configurar Rotas

```jsx
// React Router
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  {/* ... outras rotas ... */}
</Routes>
```

---

## 🧪 Testes

### 1. Testar Solicitação de Reset

```bash
curl -X POST http://localhost:5000/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com"}'
```

**Resposta esperada:**
```json
{
  "message": "Se o email estiver cadastrado, você receberá as instruções para resetar sua senha."
}
```

### 2. Verificar Email Enviado

- **Gmail:** Checar caixa de entrada
- **Mailtrap:** Acessar dashboard em https://mailtrap.io
- **Console:** Ver log no terminal do servidor

### 3. Testar Validação de Token

```bash
curl http://localhost:5000/api/password-reset/validate/SEU_TOKEN_AQUI
```

**Resposta esperada (token válido):**
```json
{
  "valid": true,
  "email": "usuario@example.com"
}
```

### 4. Testar Reset de Senha

```bash
curl -X POST http://localhost:5000/api/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "SEU_TOKEN_AQUI",
    "password": "NovaSenha123",
    "confirmPassword": "NovaSenha123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Senha redefinida com sucesso!"
}
```

### 5. Verificar no Banco

```sql
-- Ver tokens criados
SELECT * FROM password_reset_tokens ORDER BY created_at DESC;

-- Ver token específico
SELECT * FROM password_reset_tokens WHERE token = 'SEU_TOKEN';

-- Ver tokens de um usuário
SELECT prt.*, u.email 
FROM password_reset_tokens prt
JOIN users u ON prt.user_id = u.id
WHERE u.email = 'usuario@example.com';
```

---

## 🔐 Segurança

### Boas Práticas Implementadas

1. **Tokens Seguros**
   - Gerados com `crypto.randomBytes(32)`
   - 32 bytes = 256 bits de entropia
   - Armazenados como hash no banco

2. **Expiração**
   - Tokens expiram em 1 hora
   - Limpeza automática de tokens antigos

3. **Uso Único**
   - Token marcado como "usado" após reset
   - Não pode ser reutilizado

4. **Não Revela Informações**
   - Mesma resposta para email existente ou não
   - Previne enumeração de usuários

5. **Validação de Senha**
   - Mínimo 6 caracteres
   - Requer maiúsculas, minúsculas e números
   - Hash bcrypt com salt

### Melhorias Recomendadas

1. **Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 tentativas
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});

app.use('/api/password-reset/request', resetLimiter);
```

2. **CAPTCHA**
   - Adicionar reCAPTCHA no formulário
   - Previne ataques automatizados

3. **2FA (Futuro)**
   - Exigir código 2FA antes de reset
   - Email + SMS para confirmação

4. **Log de Auditoria**
   - Registrar todas as tentativas
   - Alertar usuário sobre tentativas suspeitas

---

## 🔧 Troubleshooting

### Problema: Email não chega

**Possíveis causas:**

1. **Gmail bloqueando**
   ```
   Solução: Use App Password, não senha normal
   Link: https://myaccount.google.com/apppasswords
   ```

2. **Firewall bloqueando porta SMTP**
   ```
   Solução: Verificar porta 587 ou 465
   Testar com: telnet smtp.gmail.com 587
   ```

3. **Email indo para spam**
   ```
   Solução: 
   - Verificar pasta de spam
   - Configurar SPF/DKIM (produção)
   - Usar serviço confiável (SendGrid)
   ```

### Problema: Token inválido/expirado

**Possíveis causas:**

1. **Token já foi usado**
   ```sql
   SELECT * FROM password_reset_tokens WHERE token = 'SEU_TOKEN';
   -- Se used = true, token já foi consumido
   ```

2. **Token expirou**
   ```sql
   SELECT NOW(), expires_at FROM password_reset_tokens WHERE token = 'SEU_TOKEN';
   -- Se NOW() > expires_at, token expirou
   ```

3. **Token não existe**
   ```
   Solução: Solicitar novo reset
   ```

### Problema: Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Verificar credenciais
psql -U seu_usuario -d agenda_jibca

# Ver logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

### Problema: Módulo não encontrado

```bash
# Reinstalar dependências
npm install

# Verificar package.json
cat package.json | grep nodemailer

# Instalar especificamente
npm install nodemailer --save
```

---

## 📊 Monitoramento

### Queries Úteis

```sql
-- Tokens ativos (não expirados, não usados)
SELECT COUNT(*) FROM password_reset_tokens 
WHERE used = FALSE AND expires_at > NOW();

-- Tokens usados hoje
SELECT COUNT(*) FROM password_reset_tokens 
WHERE used = TRUE AND used_at::date = CURRENT_DATE;

-- Usuários que mais solicitam reset
SELECT u.email, COUNT(*) as resets
FROM password_reset_tokens prt
JOIN users u ON prt.user_id = u.id
WHERE prt.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.email
ORDER BY resets DESC
LIMIT 10;

-- Tempo médio entre solicitação e uso
SELECT AVG(used_at - created_at) as tempo_medio
FROM password_reset_tokens
WHERE used = TRUE;
```

### Limpeza de Tokens Antigos

```bash
# Criar cronjob para limpar tokens
crontab -e

# Adicionar (executa todo dia às 3h da manhã)
0 3 * * * psql -U seu_usuario -d agenda_jibca -c "SELECT cleanup_expired_tokens();"
```

Ou via Node.js com `node-cron`:

```javascript
const cron = require('node-cron');
const passwordResetService = require('./services/passwordResetService');

// Executar limpeza todo dia às 3h
cron.schedule('0 3 * * *', async () => {
  const deleted = await passwordResetService.cleanupExpiredTokens();
  console.log(`🧹 Limpeza: ${deleted} tokens removidos`);
});
```

---

## ✅ Checklist de Implementação

- [ ] Migration executada
- [ ] Tabela `password_reset_tokens` criada
- [ ] Dependências instaladas (`nodemailer`)
- [ ] Variáveis de ambiente configuradas
- [ ] Email de teste enviado com sucesso
- [ ] Services copiados para `src/services/`
- [ ] Rotas adicionadas ao server
- [ ] Frontend: página "Esqueci a senha" criada
- [ ] Frontend: página "Redefinir senha" criada
- [ ] Link "Esqueceu a senha?" adicionado ao login
- [ ] Testes manuais realizados
- [ ] Rate limiting configurado (opcional)
- [ ] Cronjob de limpeza configurado (opcional)

---

## 📚 Recursos Adicionais

- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid](https://sendgrid.com/)
- [Mailtrap](https://mailtrap.io/)
- [OWASP Password Reset](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

---

## 🤝 Suporte

Se tiver problemas, verifique:

1. Logs do servidor Node.js
2. Logs do PostgreSQL
3. Console do navegador (frontend)
4. Variáveis de ambiente configuradas
5. Conexão com banco de dados

---

**Desenvolvido para Agenda JIBCA** 🎉