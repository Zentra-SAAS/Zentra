/*
  # Create Sale Items Table

  1. New Tables
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, references sales)
      - `product_id` (uuid, references products)
      - `quantity` (integer, quantity sold)
      - `unit_price` (decimal, price per unit at time of sale)
      - `total_price` (decimal, total price for this item)
      - `discount_amount` (decimal, discount applied to this item)

  2. Security
    - Enable RLS on `sale_items` table
    - Add policy for organization members to manage sale items
    - Add policy for employees to manage their own sale items

  3. Constraints
    - Check constraints for positive quantities and prices
    - Foreign key constraints with proper cascading
*/

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  discount_amount decimal(10,2) DEFAULT 0 CHECK (discount_amount >= 0)
);

-- Enable RLS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON sale_items(product_id);

-- RLS Policies
CREATE POLICY "Users can manage sale items based on sale access"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (
        sales.employee_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shops 
          JOIN users ON users.org_id = shops.org_id
          WHERE shops.id = sales.shop_id 
          AND users.id = auth.uid()
          AND users.role IN ('Owner', 'Manager')
        )
      )
    )
  );

-- Function to update inventory when sale items are added/updated
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  shop_id_var uuid;
BEGIN
  -- Get shop_id from the sale
  SELECT shops.id INTO shop_id_var
  FROM sales 
  JOIN shops ON sales.shop_id = shops.id
  WHERE sales.id = COALESCE(NEW.sale_id, OLD.sale_id);
  
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE inventory 
    SET quantity = quantity - NEW.quantity,
        updated_at = now(),
        last_updated_by = auth.uid()
    WHERE shop_id = shop_id_var 
    AND product_id = NEW.product_id;
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Revert old quantity and apply new quantity
    UPDATE inventory 
    SET quantity = quantity + OLD.quantity - NEW.quantity,
        updated_at = now(),
        last_updated_by = auth.uid()
    WHERE shop_id = shop_id_var 
    AND product_id = NEW.product_id;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Restore inventory
    UPDATE inventory 
    SET quantity = quantity + OLD.quantity,
        updated_at = now(),
        last_updated_by = auth.uid()
    WHERE shop_id = shop_id_var 
    AND product_id = OLD.product_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update inventory on sale item changes
CREATE TRIGGER update_inventory_on_sale_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();