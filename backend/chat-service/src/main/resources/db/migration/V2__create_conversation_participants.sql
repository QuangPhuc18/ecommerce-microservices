CREATE TABLE conversation_participants (
    id                BIGSERIAL PRIMARY KEY,
    conversation_id   UUID NOT NULL REFERENCES conversations(id),
    user_id           UUID NOT NULL,
    last_read_at      TIMESTAMP,
    last_read_message_id UUID,
    joined_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_participants_conversation_id ON conversation_participants(conversation_id);
