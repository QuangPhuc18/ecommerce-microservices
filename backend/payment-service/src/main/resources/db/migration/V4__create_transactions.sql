CREATE TABLE transactions (
    id              UUID PRIMARY KEY,
    wallet_id       UUID NOT NULL REFERENCES wallets(id),
    user_id         UUID NOT NULL,
    type            VARCHAR(20) NOT NULL,
    amount          DECIMAL(19, 2) NOT NULL,
    balance_before  DECIMAL(19, 2),
    balance_after   DECIMAL(19, 2),
    order_id        UUID,
    payment_id      UUID,
    reference       VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
