INSERT INTO categories (id, name, slug, active)
VALUES (1, 'Default Category', 'default-category', true)
ON CONFLICT (id) DO NOTHING;
