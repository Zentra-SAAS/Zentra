/*
  # Create Shops Table

  1. New Tables
    - `shops`
      - `id` (uuid, primary key)
      - `name` (text, shop name)
      - `location` (text, shop location/address)
      - `category` (text, shop category/type)
      - `org_id` (uuid, references organizations)
      - `manager_id` (uuid, references users, optional)
      - `is_active` (boolean, shop status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `shops` table
    - Add policy for organization owners to manage shops
    - Add policy for managers to read/update assigned shops
    - Add policy for employees to read shops in their organization

  3. Constraints
    - Foreign key constraints with proper cascading
    - Check constraint for manager role validation
*/

CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS shops_org_id_idx ON shops(org_id);
CREATE INDEX IF NOT EXISTS shops_manager_id_idx ON shops(manager_id);
CREATE INDEX IF NOT EXISTS shops_is_active_idx ON shops(is_active);

-- RLS Policies
CREATE POLICY "Organization owners can manage all shops in their org"
  ON shops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = shops.org_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Managers can read and update their assigned shops"
  ON shops
  FOR ALL
  TO authenticated
  USING (
    shops.manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = shops.org_id 
      AND users.role = 'Manager'
    )
  );

CREATE POLICY "Employees can read shops in their organization"
  ON shops
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.org_id = shops.org_id
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate manager assignment
CREATE OR REPLACE FUNCTION validate_shop_manager()
RETURNS TRIGGER AS $$
BEGIN
  -- If manager_id is provided, ensure the user is a Manager in the same organization
  IF NEW.manager_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = NEW.manager_id 
      AND users.org_id = NEW.org_id 
      AND users.role = 'Manager'
    ) THEN
      RAISE EXCEPTION 'Manager must be a user with Manager role in the same organization';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate manager assignment
CREATE TRIGGER validate_shop_manager_trigger
  BEFORE INSERT OR UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION validate_shop_manager();