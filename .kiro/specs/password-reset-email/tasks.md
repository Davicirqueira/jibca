# Implementation Plan

## Overview

Este plano detalha as tarefas necessárias para ativar o sistema de recuperação de senha por email na Agenda JIBCA. O sistema já possui 90% da infraestrutura implementada, necessitando apenas ativar o envio de emails e melhorar templates.

---

## Tasks

### 1. Ativar envio de emails no EmailService

- [x] 1.1 Modificar `app/backend/src/services/EmailService.js` para ativar transporter do Nodemailer
  - Remover código que apenas loga e não envia
  - Configurar transporter com variáveis do `.env`
  - Adicionar tratamento de erros detalhado
  - Implementar logs informativos
  - Requirements: 1.1, 2.1, 2.3, 2.4

- [x] 1.2 Implementar template HTML com identidade visual JIBCA
  - Criar template responsivo para email
  - Aplicar cores oficiais (#3D1F1F, #C0C0C0)
  - Incluir referência bíblica (1 Timóteo 4:12)
  - Adicionar botão CTA destacado
  - Incluir URL alternativa como texto
  - Requirements: 3.1, 3.2, 3.3, 3.4, 3.5

- [x] 1.3 Adicionar validação de configurações ao iniciar servidor
  - Verificar presença de EMAIL_USER e EMAIL_PASSWORD
  - Logar status da configuração de email
  - Desabilitar gracefully se não configurado
  - Requirements: 2.1, 2.2

### 2. Atualizar notificações para líderes

- [x] 2.1 Modificar `app/backend/src/controllers/AuthController.js` no método `forgotPassword`
  - Incluir status do envio de email na notificação aos líderes
  - Adicionar informação se email foi enviado com sucesso ou falhou
  - Melhorar mensagem da notificação
  - Requirements: 4.1, 4.2, 4.5

### 3. Validar e testar fluxo completo

- [x] 3.1 Testar configuração e inicialização
  - Iniciar servidor backend
  - Verificar logs de configuração de email
  - Confirmar que transporter foi criado corretamente
  - Requirements: 6.1, 6.2

- [x] 3.2 Testar envio de email de recuperação
  - Acessar `/forgot-password` no frontend
  - Solicitar recuperação com email válido
  - Monitorar logs do backend
  - Verificar recebimento do email
  - Validar template HTML no cliente de email
  - Requirements: 1.1, 1.2, 6.4

- [x] 3.3 Testar fluxo de redefinição de senha
  - Clicar no link do email
  - Validar redirecionamento para `/reset-password`
  - Redefinir senha
  - Testar login com nova senha
  - Requirements: 1.3, 1.5

- [x] 3.4 Testar cenários de erro
  - Testar com email não cadastrado (mensagem genérica)
  - Testar rate limiting (3 solicitações por hora)
  - Testar token expirado
  - Testar token já usado
  - Requirements: 5.1, 5.2, 5.3, 5.4, 5.5

- [x] 3.5 Validar logs e troubleshooting
  - Verificar logs de sucesso
  - Verificar logs de erro
  - Validar informações para debug
  - Requirements: 2.3, 2.4, 2.5, 6.3, 6.5

### 4. Checkpoint - Validação final

- Garantir que todos os testes passaram
- Confirmar que emails estão sendo enviados
- Validar que template está correto
- Verificar que notificações aos líderes funcionam
- Resolver quaisquer problemas identificados

---

## Notes

- Todas as interfaces frontend já estão implementadas e funcionais
- Toda a lógica de tokens já está implementada e testada
- Gmail já está configurado com App Password
- Variáveis de ambiente já estão no `.env`
- Nodemailer já está instalado como dependência
- Foco principal: ativar código existente e melhorar template

## Testing Approach

Os testes serão realizados de forma colaborativa:
- Desenvolvedor executa os testes manualmente
- Monitora logs em tempo real
- Envia prints em caso de erros
- Análise ampla do sistema (frontend, backend, PostgreSQL)
- Identificação e resolução de problemas com base em evidências

## Success Criteria

- Email de recuperação é enviado com sucesso
- Template HTML é renderizado corretamente
- Link de recuperação funciona
- Senha é redefinida com sucesso
- Líderes recebem notificação com status do envio
- Logs fornecem informações úteis para debug
- Rate limiting funciona corretamente
- Mensagens genéricas protegem privacidade
