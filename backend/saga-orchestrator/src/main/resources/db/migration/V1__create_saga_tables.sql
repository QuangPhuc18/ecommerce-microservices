CREATE TABLE saga_instances (
    id              UUID PRIMARY KEY,
    saga_type       VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    current_step    INT NOT NULL DEFAULT 0,
    total_steps     INT NOT NULL,
    payload         TEXT,
    started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP,
    failed_at       TIMESTAMP,
    failure_reason  TEXT
);

CREATE TABLE saga_outbox (
    id              UUID PRIMARY KEY,
    saga_instance_id UUID NOT NULL REFERENCES saga_instances(id),
    event_type      VARCHAR(100) NOT NULL,
    payload         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMP
);

CREATE INDEX idx_saga_instances_status ON saga_instances(status);
CREATE INDEX idx_saga_outbox_status ON saga_outbox(status);
CREATE INDEX idx_saga_outbox_instance_id ON saga_outbox(saga_instance_id);
