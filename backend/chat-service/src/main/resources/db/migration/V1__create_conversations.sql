CREATE TABLE conversations (
    id              UUID PRIMARY KEY,
    listing_id      BIGINT,
    listing_title   VARCHAR(255),
    last_message    TEXT,
    last_message_at TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
