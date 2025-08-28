/*
  # Create Inventory Table

  1. New Tables
    - `inventory`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, references shops)
      - `product_id` (uuid, references products)
      - `quantity` (integer, current stock quantity)
      - `min_quantity` (integer, minimum stock threshold)
      - `max_quantity` (integer, maximum stock capacity)
      - `last_updated_by` (uuid, references users)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inventory` table
    - Add policy for organization members to manage inventory
    - Add policy for shop-specific access

  3. Constraints
    - Unique constraint on shop_id + product_id combination
    - Check constraints for non-negative quantities
*/

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity integer DEFAULT 0 CHECK (min_quantity >= 0),
  max_quantity integer DEFAULT 1000 CHECK (max_quantity >= min_quantity),
  last_updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, product_id)
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS inventory_shop_id_idx ON inventory(shop_id);
CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON inventory(product_id);
CREATE INDEX IF NOT EXISTS inventory_quantity_idx ON inventory(quantity);
CREATE INDEX IF NOT EXISTS inventory_low_stock_idx ON inventory(shop_id, product_id) WHERE quantity <= min_quantity;

-- RLS Policies
CREATE POLICY "Organization members can manage inventory"
  ON inventory
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      JOIN users ON users.org_id = shops.org_id
      WHERE shops.id = inventory.shop_id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Shop employees can read inventory for their assigned shops"
  ON inventory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_employees 
      WHERE shop_employees.shop_id = inventory.shop_id 
      AND shop_employees.employee_id = auth.uid()
      AND shop_employees.is_active = true
    )
  );

-- Function to update inventory timestamp and user
CREATE OR REPLACE FUNCTION update_inventory_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for inventory updates
CREATE TRIGGER update_inventory_metadata_trigger
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_metadata();