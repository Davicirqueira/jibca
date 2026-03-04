# Guia de Teste - Sistema de Notificações

## 📋 Visão Geral

O sistema de notificações está **completamente implementado** com:
- ✅ Backend com API REST completa
- ✅ Frontend com interface visual moderna
- ✅ Sistema de agendamento automático (cron jobs)
- ✅ Notificações em tempo real (polling)

## 🎯 Como Acessar

### 1. Via Interface Web
1. Faça login no sistema
2. Clique em **"Notificações"** no menu lateral (ícone de sino 🔔)
3. Ou acesse diretamente: `http://localhost:5173/notifications`

### 2. Via Dashboard
1. No Dashboard, clique no card **"Central de Notificações"**
2. Você verá o ícone de sino vermelho

## 🧪 Testes Manuais

### Teste 1: Criar Notificação de Teste (Backend)

Você pode criar notificações manualmente via API para testar:

```bash
# 1. Obter seu token de autenticação (faça login primeiro)
# 2. Criar notificação personalizada (apenas para Líderes)

curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "user_ids": [1, 2, 3],
    "message": "Esta é uma notificação de teste!",
    "type": "custom"
  }'
```

### Teste 2: Criar Notificação via Evento

A forma mais fácil de testar é criar um novo evento:

1. Vá para **Eventos** → **Criar Novo Evento**
2. Preencha os dados e salve
3. O sistema automaticamente criará notificações para todos os usuários ativos
4. Vá para **Notificações** e veja a nova notificação

### Teste 3: Testar Lembretes Automáticos

Para testar os lembretes automáticos:

1. Crie um evento para **amanhã** (24h no futuro)
2. Configure as variáveis de ambiente no `.env`:
   ```env
   NOTIFICATION_ENABLED=true
   DAILY_REMINDER_TIME=09:00
   HOURLY_REMINDER_ENABLED=true
   ```
3. Reinicie o backend
4. Aguarde o horário configurado ou use o endpoint de teste

### Teste 4: Endpoint de Teste (Desenvolvimento)

```bash
# Executar teste do sistema (apenas em desenvolvimento)
curl -X POST http://localhost:3000/api/v1/notifications/test \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔍 Funcionalidades para Testar

### Na Interface de Notificações

1. **Visualização**
   - [ ] Ver lista de notificações
   - [ ] Ver estatísticas (Total, Não Lidas, Lidas)
   - [ ] Ver badge de não lidas no menu

2. **Filtros**
   - [ ] Filtrar por "Todas"
   - [ ] Filtrar por "Não Lidas"
   - [ ] Filtrar por "Lidas"

3. **Ações**
   - [ ] Marcar uma notificação como lida (clique no card)
   - [ ] Marcar todas como lidas (botão no topo)
   - [ ] Atualizar lista (botão refresh)

4. **Paginação**
   - [ ] Navegar entre páginas
   - [ ] Ver contador de notificações

5. **Atualização Automática**
   - [ ] Aguardar 1 minuto e ver se novas notificações aparecem automaticamente

## 📊 Tipos de Notificações

O sistema suporta os seguintes tipos:

| Tipo | Descrição | Quando é Criada |
|------|-----------|-----------------|
| `new_event` | Novo evento criado | Ao criar um evento |
| `event_updated` | Evento atualizado | Ao editar um evento |
| `event_reminder` | Lembrete de evento | 24h antes ou 1h antes (automático) |
| `custom` | Notificação personalizada | Enviada por líderes |

## 🔧 Verificar Configuração

### 1. Verificar Variáveis de Ambiente

No arquivo `app/backend/.env`:

```env
# Notificações
NOTIFICATION_ENABLED=true
DAILY_REMINDER_TIME=09:00
HOURLY_REMINDER_ENABLED=true
NOTIFICATION_CLEANUP_DAYS=90
```

### 2. Verificar Saúde do Sistema

```bash
curl http://localhost:3000/api/v1/notifications/health \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "health": {
      "scheduler_running": true,
      "enabled": true,
      "active_jobs": 3,
      "configuration_valid": true
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Verificar Estatísticas do Sistema (Apenas Líderes)

```bash
curl http://localhost:3000/api/v1/notifications/system-stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🎨 Interface Visual

A interface de notificações inclui:

- **Cards modernos** com cores por tipo de notificação
- **Badges animados** para notificações não lidas
- **Estatísticas visuais** com ícones
- **Filtros interativos** com tabs
- **Paginação completa**
- **Atualização automática** a cada 1 minuto
- **Botão de refresh manual**
- **Indicador de status** (lida/não lida)

## 🐛 Troubleshooting

### Notificações não aparecem?

1. Verifique se o backend está rodando
2. Verifique se você está autenticado
3. Verifique o console do navegador para erros
4. Verifique se existem