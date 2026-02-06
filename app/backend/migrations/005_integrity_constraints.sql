-- Migration: Constraints de integridade referencial
-- Data: 06 de Fevereiro de 2026
-- Descrição: Adiciona constraints para garantir integridade dos dados

-- Constraint para unique confirmation por usuário/evento
ALTER TABLE confirmations 
ADD CONSTRAINT unique_user_event_confirmation 
UNIQUE (user_id, event_id);

-- Constraint para validar status de confirmação
ALTER TABLE confirmations 
ADD CONSTRAINT valid_confirmation_status 
CHECK (status IN ('confirmed', 'declined', 'maybe'));

-- Constraint para validar role de usuário
ALTER TABLE users 
ADD CONSTRAINT valid_user_role 
CHECK (role IN ('leader', 'member'));

-- Constraint para validar tipo de notificação
ALTER TABLE notifications 
ADD CONSTRAINT valid_notification_type 
CHECK (type IN ('event_reminder', 'new_event', 'event_updated', 'password_reset_request', 'password_changed'));

-- Constraint para validar data de evento não muito no passado
ALTER TABLE events 
ADD CONSTRAINT reasonable_event_date 
CHECK (date >= '2020-01-01' AND date <= '2030-12-31');

-- Constraint para validar duração do evento
ALTER TABLE events 
ADD CONSTRAINT reasonable_event_duration 
CHECK (duration_minutes > 0 AND duration_minutes <= 1440); -- Máximo 24 horas

-- Constraint para validar expiração de token de reset (se a tabela existir)
-- Esta será executada apenas se a tabela password_reset_tokens existir