CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    subtotal DECIMAL(19, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
