CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD', 'HIDDEN');

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    category_id BIGINT NOT NULL,
    seller_id UUID NOT NULL,
    seller_name VARCHAR(150) NOT NULL,
    status product_status NOT NULL DEFAULT 'ACTIVE',
    attributes_json TEXT,
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
