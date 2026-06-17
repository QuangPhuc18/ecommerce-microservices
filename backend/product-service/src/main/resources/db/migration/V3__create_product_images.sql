CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
