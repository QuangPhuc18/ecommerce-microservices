CREATE TABLE dashboard_metrics (
    id              BIGSERIAL PRIMARY KEY,
    metric_key      VARCHAR(100) NOT NULL UNIQUE,
    metric_value    BIGINT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
