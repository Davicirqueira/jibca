-- Migration: Adicionar tipo de evento "Passeio"
-- Data: 2026-02-02
-- Descrição: Adiciona o tipo de evento "Passeio" para atividades recreativas da juventude

-- Inserir novo tipo de evento "Passeio"
INSERT INTO event_types (name, color, icon) VALUES
    ('Passeio', '#10B981', 'map-pin')
ON CONFLICT (name) DO NOTHING;

-- Comentário explicativo
COMMENT ON TABLE event_types IS 'Tipos de eventos disponíveis para a juventude JIBCA';

-- Verificar se a inserção foi bem-sucedida
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM event_types WHERE name = 'Passeio') THEN
        RAISE NOTICE 'Tipo de evento "Passeio" adicionado com sucesso!';
    ELSE
        RAISE EXCEPTION 'Falha ao adicionar tipo de evento "Passeio"';
    END IF;
END $$;