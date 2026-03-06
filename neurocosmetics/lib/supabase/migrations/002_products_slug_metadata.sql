-- Добавление slug и metadata в products (для существующих БД)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
