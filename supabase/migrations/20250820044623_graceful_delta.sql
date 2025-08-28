/*
  # Create Additional Tables for Future Features

  1. New Tables
    - `products` (for inventory management)
    - `sales` (for sales tracking)
    - `employee_assignments` (for shop-employee relationships)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for role-based access
*/

-- Products table for inventory management
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  category text DEFAULT '',
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for organization members to read products
CREATE POLICY "Organization members can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = products.org_id
    )
  );

-- Policy for owners and managers to manage products
CREATE POLICY "Owners and managers can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = products.org_id
      AND users.role IN ('Owner', 'Manager')
    )
  );

-- Sales table for transaction tracking
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  transaction_date timestamptz DEFAULT now(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policy for organization members to read sales
CREATE POLICY "Organization members can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = sales.org_id
    )
  );

-- Policy for employees to create sales records
CREATE POLICY "Employees can create sales records"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employee_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = sales.org_id
    )
  );

-- Employee assignments table for shop-employee relationships
CREATE TABLE IF NOT EXISTS employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(employee_id, shop_id)
);

ALTER TABLE employee_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for organization members to read assignments
CREATE POLICY "Organization members can read assignments"
  ON employee_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN shops s ON s.id = employee_assignments.shop_id
      WHERE u1.id = auth.uid() 
      AND u1.org_id = s.org_id
    )
  );

-- Policy for owners and managers to manage assignments
CREATE POLICY "Owners and managers can manage assignments"
  ON employee_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN shops s ON s.id = employee_assignments.shop_id
      WHERE u1.id = auth.uid() 
      AND u1.org_id = s.org_id
      AND u1.role IN ('Owner', 'Manager')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_employee_id ON sales(employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_org_id ON sales(org_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_employee_id ON employee_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_shop_id ON employee_assignments(shop_id);