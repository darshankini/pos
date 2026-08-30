-- POS schema (PostgreSQL). The `post` database itself is created by migrate.js.

-- Staff / admin users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  name       VARCHAR(100),
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(150)  NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  image       VARCHAR(255),
  is_active   SMALLINT      NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ   DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Orders (one receipt = one order)
CREATE TABLE IF NOT EXISTS orders (
  id         SERIAL PRIMARY KEY,
  total      NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_count INT           NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT,
  name       VARCHAR(150)  NOT NULL,          -- snapshot at sale time
  price      NUMERIC(10,2) NOT NULL,          -- snapshot
  qty        INT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);

-- Seed categories (admin user + products come from `npm run seed`).
INSERT INTO categories (name) VALUES
  ('Starters'), ('Main Course'), ('Beverages'), ('Desserts')
ON CONFLICT (name) DO NOTHING;
