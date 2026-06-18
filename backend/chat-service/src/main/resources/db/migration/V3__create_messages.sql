CREATE TABLE messages (
    id                UUID PRIMARY KEY,
    conversation_id   UUID NOT NULL REFERENCES conversations(id),
    sender_id         UUID NOT NULL,
    content           TEXT NOT NULL,
    message_type      VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    client_generated_id VARCHAR(100),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at);
