/*
  # Create Sales Table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, references shops)
      - `employee_id` (uuid, references users)
      - `total_amount` (decimal, total sale amount)
      - `tax_amount` (decimal, tax amount)
      - `discount_amount` (decimal, discount amount)
      - `payment_method` (text, payment method)
      - `status` (text, sale status)
      - `notes` (text, additional notes)
      - `sale_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sales` table
    - Add policy for organization members to manage sales
    - Add policy for employees to manage their own sales

  3. Constraints
    - Check constraints for non-negative amounts
    - Check constraint for valid payment methods and status
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount decimal(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount decimal(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital', 'bank_transfer', 'other')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  notes text DEFAULT '',
  sale_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS sales_shop_id_idx ON sales(shop_id);
CREATE INDEX IF NOT EXISTS sales_employee_id_idx ON sales(employee_id);
CREATE INDEX IF NOT EXISTS sales_sale_date_idx ON sales(sale_date);
CREATE INDEX IF NOT EXISTS sales_status_idx ON sales(status);
CREATE INDEX IF NOT EXISTS sales_payment_method_idx ON sales(payment_method);

-- RLS Policies
CREATE POLICY "Organization owners and managers can view all sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      JOIN users ON users.org_id = shops.org_id
      WHERE shops.id = sales.shop_id 
      AND users.id = auth.uid()
      AND users.role IN ('Owner', 'Manager')
    )
  );

CREATE POLICY "Employees can manage their own sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM shop_employees 
      WHERE shop_employees.shop_id = sales.shop_id 
      AND shop_employees.employee_id = auth.uid()
      AND shop_employees.is_active = true
    )
  );

CREATE POLICY "Organization owners can manage all sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      JOIN organizations ON shops.org_id = organizations.id
      WHERE shops.id = sales.shop_id 
      AND organizations.owner_id = auth.uid()
    )
  );

-- Function to validate sale employee
CREATE OR REPLACE FUNCTION validate_sale_employee()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the employee is assigned to the shop
  IF NOT EXISTS (
    SELECT 1 FROM shop_employees 
    WHERE shop_employees.shop_id = NEW.shop_id 
    AND shop_employees.employee_id = NEW.employee_id
    AND shop_employees.is_active = true
  ) THEN
    RAISE EXCEPTION 'Employee must be assigned to the shop to create sales';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate sale employee
CREATE TRIGGER validate_sale_employee_trigger
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION validate_sale_employee();