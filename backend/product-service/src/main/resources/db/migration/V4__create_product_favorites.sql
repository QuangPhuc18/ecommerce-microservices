CREATE TABLE IF NOT EXISTS product_favorites (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_favorite_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_product_user UNIQUE (product_id, user_id)
);

CREATE INDEX idx_favorites_product_id ON product_favorites(product_id);
CREATE INDEX idx_favorites_user_id ON product_favorites(user_id);
