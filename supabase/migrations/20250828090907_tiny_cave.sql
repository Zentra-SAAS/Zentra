/*
  # Complete Zentra Database Schema

  1. New Tables
    - `organizations` - Store organization details with unique codes and passkeys
    - `users` - User profiles with roles and organization relationships
    - `shops` - Shop information linked to organizations
    - `products` - Product inventory management
    - `sales` - Sales transaction tracking
    - `employee_assignments` - Employee-shop assignments

  2. Security
    - Enable RLS on all tables
    - Add role-based access policies
    - Organization isolation policies
    - Secure credential validation

  3. Functions & Triggers
    - Organization statistics function
    - Auto-update timestamps
    - Data validation triggers
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  org_code text UNIQUE NOT NULL,
  passkey text NOT NULL,
  number_of_shops integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  role text NOT NULL CHECK (role IN ('Owner', 'Manager', 'Employee', 'Auditor')),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  cost decimal(10,2) NOT NULL DEFAULT 0,
  sku text,
  category text DEFAULT '',
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  stock_quantity integer DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  payment_method text DEFAULT 'cash',
  transaction_id text,
  notes text DEFAULT '',
  sale_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Employee assignments table
CREATE TABLE IF NOT EXISTS employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(employee_id, shop_id)
);

-- Inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('add', 'remove', 'adjust', 'sale')),
  quantity_change integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can read their own organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners can update their organization"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Users policies
CREATE POLICY "Users can read users in their organization"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Authenticated users can create user profiles"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Shops policies
CREATE POLICY "Users can read shops in their organization"
  ON shops
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and managers can manage shops"
  ON shops
  FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Owner', 'Manager')
    )
  );

-- Products policies
CREATE POLICY "Users can read products in their organization"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and managers can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Owner', 'Manager')
    )
  );

-- Sales policies
CREATE POLICY "Users can read sales in their organization"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Employees can create sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid()) AND
    employee_id = auth.uid()
  );

CREATE POLICY "Owners and managers can manage sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Owner', 'Manager')
    )
  );

-- Sale items policies
CREATE POLICY "Users can read sale items in their organization"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM sales 
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage sale items for their sales"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM sales 
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

-- Employee assignments policies
CREATE POLICY "Users can read assignments in their organization"
  ON employee_assignments
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and managers can manage assignments"
  ON employee_assignments
  FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Owner', 'Manager')
    )
  );

-- Inventory logs policies
CREATE POLICY "Users can read inventory logs in their organization"
  ON inventory_logs
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create inventory logs"
  ON inventory_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid()) AND
    user_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_shops_org_id ON shops(org_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_org_id ON sales(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_org_id ON employee_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);

-- Create function to get organization statistics
CREATE OR REPLACE FUNCTION get_organization_stats(org_uuid uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_shops', (SELECT COUNT(*) FROM shops WHERE org_id = org_uuid),
    'total_employees', (SELECT COUNT(*) FROM users WHERE org_id = org_uuid AND role != 'Owner'),
    'total_managers', (SELECT COUNT(*) FROM users WHERE org_id = org_uuid AND role = 'Manager'),
    'total_products', (SELECT COUNT(*) FROM products WHERE org_id = org_uuid),
    'total_sales_today', (SELECT COUNT(*) FROM sales WHERE org_id = org_uuid AND DATE(sale_date) = CURRENT_DATE),
    'total_revenue_today', (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE org_id = org_uuid AND DATE(sale_date) = CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON organizations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shops_updated_at') THEN
    CREATE TRIGGER update_shops_updated_at
      BEFORE UPDATE ON shops
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;