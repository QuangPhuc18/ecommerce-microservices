CREATE TABLE audit_trails (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL,
    transaction_id  UUID,
    action          VARCHAR(50) NOT NULL,
    amount          DECIMAL(19, 2) NOT NULL,
    balance_before  DECIMAL(19, 2),
    balance_after   DECIMAL(19, 2),
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_trails_user_id ON audit_trails(user_id);
CREATE INDEX idx_audit_trails_created_at ON audit_trails(created_at);
