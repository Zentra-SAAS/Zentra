/*
  # Create Products Table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `sku` (text, stock keeping unit)
      - `category` (text, product category)
      - `price` (decimal, product price)
      - `cost` (decimal, product cost)
      - `org_id` (uuid, references organizations)
      - `is_active` (boolean, product status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for organization members to manage products
    - Add policy for employees to read products

  3. Constraints
    - Unique constraint on sku per organization
    - Check constraints for positive prices
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  sku text NOT NULL,
  category text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  cost decimal(10,2) DEFAULT 0 CHECK (cost >= 0),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, sku)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS products_org_id_idx ON products(org_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);

-- RLS Policies
CREATE POLICY "Organization members can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = products.org_id
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();