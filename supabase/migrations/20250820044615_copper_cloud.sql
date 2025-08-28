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

  2. Security
    - Enable RLS on `shops` table
    - Add policy for organization members to read shops
    - Add policy for owners and managers to manage shops
*/

CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policy for organization members to read shops
CREATE POLICY "Organization members can read shops"
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

-- Policy for owners to manage all shops in their organization
CREATE POLICY "Owners can manage their organization shops"
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

-- Policy for managers to manage their assigned shops
CREATE POLICY "Managers can manage their assigned shops"
  ON shops
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = manager_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Manager'
      AND users.org_id = shops.org_id
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_shops_org_id ON shops(org_id);
CREATE INDEX IF NOT EXISTS idx_shops_manager_id ON shops(manager_id);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);