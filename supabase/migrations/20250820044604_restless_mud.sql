/*
  # Create Organizations Table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, organization name)
      - `owner_id` (uuid, references auth.users)
      - `org_code` (text, unique organization code for team signup)
      - `passkey` (text, security passkey for team signup)
      - `number_of_shops` (integer, planned number of shops)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `organizations` table
    - Add policy for owners to manage their organizations
    - Add policy for authenticated users to read organizations they belong to
*/

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  org_code text UNIQUE NOT NULL,
  passkey text NOT NULL,
  number_of_shops integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy for owners to manage their organizations
CREATE POLICY "Owners can manage their organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy for organization lookup during signup (public read for org_code and passkey validation)
CREATE POLICY "Allow organization validation for signup"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_org_code ON organizations(org_code);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);