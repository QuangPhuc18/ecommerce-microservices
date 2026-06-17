CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT,
    sort_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
