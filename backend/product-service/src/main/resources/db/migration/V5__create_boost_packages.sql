CREATE TABLE IF NOT EXISTS boost_packages (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_boost_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_boost_packages_product_id ON boost_packages(product_id);
CREATE INDEX idx_boost_packages_active_end ON boost_packages(active, end_date);
