-- Migration: Tabela de tokens de recuperação de senha
-- Data: 05 de Fevereiro de 2026

-- Tabela de tokens de recuperação de senha
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_used ON password_reset_tokens(used);

-- Comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens de recuperação de senha com validade de 1 hora';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único gerado para recuperação de senha';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Data e hora de expiração do token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica se o token já foi utilizado';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Data e hora em que o token foi utilizado';
