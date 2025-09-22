/*
  # Create Organizations Table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, organization name)
      - `owner_id` (uuid, references auth.users)
      - `org_code` (text, unique organization code for joining)
      - `passkey` (text, security passkey for verification)
      - `number_of_shops` (integer, planned number of shops)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `organizations` table
    - Add policy for owners to manage their organizations
    - Add policy for authenticated users to read organizations they belong to

  3. Indexes
    - Unique index on org_code for fast lookups
    - Index on owner_id for owner queries
*/

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

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS organizations_org_code_idx ON organizations(org_code);
CREATE INDEX IF NOT EXISTS organizations_owner_id_idx ON organizations(owner_id);

-- RLS Policies
CREATE POLICY "Owners can manage their organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can read organizations they belong to"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.org_id = organizations.id 
      AND users.id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();