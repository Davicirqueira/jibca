# 🔧 Soluções para Erros Comuns - JIBCA Agenda Backend

## ✅ Correções Aplicadas

Corrigi os seguintes problemas identificados no feedback:

1. **Erro de importação no middleware de autenticação** - Caminho corrigido
2. **Hash de senha inválido na migration** - Removido da migration, mantido apenas no seed
3. **Inicialização do agendador de notificações** - Adicionado tratamento de erro
4. **Script de verificação** - Criado para diagnosticar problemas

## 🚀 Passos para Testar (Atualizados)

### 1. Verificar Configuração
```bash
cd app/backend
npm run check
```

### 2. Configurar PostgreSQL

**Windows:**
```bash
# Iniciar PostgreSQL
net start postgresql-x64-14

# Ou via Services (services.msc)
# Procurar por "postgresql" e iniciar o serviço
```

**Linux/Mac:**
```bash
# Iniciar PostgreSQL
sudo service postgresql start
# ou
brew services start postgresql
```

### 3. Criar Banco de Dados
```bash
# Opção 1: Linha de comando
createdb jibca_agenda

# Opção 2: Via psql
psql -U postgres
CREATE DATABASE jibca_agenda;
\q
```

### 4. Executar Setup
```bash
npm run setup
```

### 5. Iniciar Servidor
```bash
npm run dev
```

## 🔍 Diagnóstico de Problemas

### Erro: "Connection refused"
**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Windows
net start postgresql-x64-14

# Verificar se está rodando
netstat -an | findstr :5432

# Linux/Mac
sudo service postgresql start
lsof -i :5432
```

### Erro: "Database does not exist"
**Causa:** Banco `jibca_agenda` não foi criado

**Solução:**
```bash
createdb jibca_agenda
```

### Erro: "Authentication failed"
**Causa:** Credenciais incorretas no `.env`

**Solução:**
1. Verificar usuário e senha do PostgreSQL
2. Atualizar arquivo `.env`:
```env
DB_USER=postgres
DB_PASSWORD=sua_senha_real
```

### Erro: "Port already in use"
**Causa:** Porta 3000 já está sendo usada

**Solução:**
```bash
# Alterar porta no .env
PORT=3001

# Ou matar processo na porta 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

## 📋 Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `jibca_agenda` criado
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Migrations executadas (`npm run migrate`)
- [ ] Dados populados (`npm run seed`)

## 🧪 Teste Rápido

Após seguir todos os passos, teste:

```bash
# 1. Verificar configuração
npm run check

# 2. Executar setup
npm run setup

# 3. Iniciar servidor
npm run dev
```

**Resultado esperado:**
```
🚀 Servidor JIBCA Agenda rodando na porta 3000
📅 Ambiente: development
🔗 Conectado ao banco de dados PostgreSQL
📬 Sistema de notificações iniciado
```

## 🔗 Teste da API

Com o servidor rodando, teste no navegador ou Postman:

```
GET http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-28T...",
  "service": "JIBCA Agenda Backend"
}
```

## 📞 Suporte

Se ainda houver problemas:

1. Execute `npm run check` e compartilhe o resultado
2. Verifique os logs do servidor
3. Confirme que o PostgreSQL está rodando na porta 5432
4. Teste a conexão manual: `psql -h localhost -U postgres -d jibca_agenda`

## 🎯 Credenciais de Teste

Após setup bem-sucedido:

**Líder:**
- Email: `chris@jibca.org`
- Senha: `jibca2024`

**Membro:**
- Email: `joao@exemplo.com`
- Senha: `jibca2024`