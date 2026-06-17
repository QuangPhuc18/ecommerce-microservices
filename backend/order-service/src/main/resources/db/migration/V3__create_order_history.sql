CREATE TABLE order_histories (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_histories_order_id ON order_histories(order_id);
