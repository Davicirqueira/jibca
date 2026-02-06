-- Migration: Índices adicionais para performance
-- Data: 06 de Fevereiro de 2026
-- Descrição: Adiciona índices para otimizar queries frequentes

-- Índices compostos para otimização de queries complexas
CREATE INDEX IF NOT EXISTS idx_events_date_type ON events(date, event_type_id);
CREATE INDEX IF NOT EXISTS idx_confirmations_event_status ON confirmations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Índices para queries de dashboard
CREATE INDEX IF NOT EXISTS idx_events_created_by_date ON events(created_by, date DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- Índices para queries de relatórios
CREATE INDEX IF NOT EXISTS idx_confirmations_status_date ON confirmations(status, confirmed_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_sent ON notifications(type, sent_at);

-- Índice simples para busca de texto em eventos (sem full-text)
CREATE INDEX IF NOT EXISTS idx_events_title ON events(title);
CREATE INDEX IF NOT EXISTS idx_events_description ON events(description);

-- Comentários explicativos
COMMENT ON INDEX idx_events_date_type IS 'Otimiza listagem de eventos por data e tipo';
COMMENT ON INDEX idx_confirmations_event_status IS 'Otimiza contagem de confirmações por status';
COMMENT ON INDEX idx_notifications_user_unread IS 'Otimiza busca de notificações não lidas';
COMMENT ON INDEX idx_events_title IS 'Otimiza busca por título de eventos';
COMMENT ON INDEX idx_events_description IS 'Otimiza busca por descrição de eventos';