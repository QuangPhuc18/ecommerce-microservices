CREATE TABLE system_reports (
    id              UUID PRIMARY KEY,
    reporter_id     UUID NOT NULL,
    product_id      BIGINT NOT NULL,
    reason          VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by     UUID,
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON system_reports(status);
CREATE INDEX idx_reports_reporter ON system_reports(reporter_id);
