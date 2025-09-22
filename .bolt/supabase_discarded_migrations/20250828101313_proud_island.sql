/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, full name)
      - `email` (text, email address)
      - `phone` (text, phone number)
      - `role` (text, user role: Owner, Manager, Employee)
      - `org_id` (uuid, references organizations)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for owners to manage users in their organization
    - Add policy for managers to read users in their organization

  3. Constraints
    - Check constraint for valid roles
    - Foreign key constraints with proper cascading
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  role text NOT NULL CHECK (role IN ('Owner', 'Manager', 'Employee')),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS users_org_id_idx ON users(org_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- RLS Policies
CREATE POLICY "Users can read and update their own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Organization owners can manage all users in their org"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = users.org_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Managers can read users in their organization"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS current_user
      WHERE current_user.id = auth.uid()
      AND current_user.org_id = users.org_id
      AND current_user.role IN ('Manager', 'Owner')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();