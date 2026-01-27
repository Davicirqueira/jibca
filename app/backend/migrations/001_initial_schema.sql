-- Migration: Criação do schema inicial do banco de dados JIBCA Agenda

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de tipos de evento
CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50) NOT NULL DEFAULT 'calendar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de evento padrão
INSERT INTO event_types (name, color, icon) VALUES
    ('Culto', '#3B82F6', 'church'),
    ('Retiro', '#10B981', 'mountain'),
    ('Reunião', '#F59E0B', 'users'),
    ('Estudo Bíblico', '#8B5CF6', 'book'),
    ('Confraternização', '#EF4444', 'heart'),
    ('Evangelismo', '#06B6D4', 'megaphone');

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'member')) DEFAULT 'member',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type_id INTEGER NOT NULL REFERENCES event_types(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200),
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de confirmações de presença
CREATE TABLE confirmations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('confirmed', 'declined', 'maybe')),
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Tabela de notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('event_reminder', 'new_event', 'event_updated')),
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Índices para otimização de performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_type ON events(event_type_id);
CREATE INDEX idx_confirmations_event ON confirmations(event_id);
CREATE INDEX idx_confirmations_user ON confirmations(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confirmations_updated_at BEFORE UPDATE ON confirmations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário líder padrão (Tio Chris)
-- Senha padrão: "jibca2024" (deve ser alterada no primeiro login)
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Tio Chris', 'chris@jibca.org', '$2b$10$rQZ8kHWKQVnqVQVnqVQVnO8kHWKQVnqVQVnqVQVnqVQVnqVQVnqVQ', 'leader');

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Usuários do sistema (líderes e membros da juventude)';
COMMENT ON TABLE events IS 'Eventos da juventude JIBCA';
COMMENT ON TABLE event_types IS 'Tipos de eventos disponíveis';
COMMENT ON TABLE confirmations IS 'Confirmações de presença dos membros nos eventos';
COMMENT ON TABLE notifications IS 'Notificações enviadas aos usuários';

-- Comentários nas colunas importantes
COMMENT ON COLUMN users.role IS 'Perfil do usuário: leader (líder) ou member (membro)';
COMMENT ON COLUMN events.duration_minutes IS 'Duração do evento em minutos';
COMMENT ON COLUMN confirmations.status IS 'Status da confirmação: confirmed, declined ou maybe';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação: event_reminder, new_event ou event_updated';