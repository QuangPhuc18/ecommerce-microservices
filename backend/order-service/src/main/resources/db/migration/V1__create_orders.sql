CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(19, 2) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(500),
    ward VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
