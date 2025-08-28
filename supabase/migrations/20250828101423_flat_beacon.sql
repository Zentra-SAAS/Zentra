/*
  # Create Audit Logs Table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `action` (text, action performed)
      - `table_name` (text, affected table)
      - `record_id` (uuid, affected record id)
      - `old_values` (jsonb, previous values)
      - `new_values` (jsonb, new values)
      - `ip_address` (text, user IP address)
      - `user_agent` (text, user agent string)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policy for organization owners to view audit logs
    - Add policy for managers to view logs for their shops

  3. Indexes
    - Indexes for efficient querying by user, table, and date
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);

-- RLS Policies
CREATE POLICY "Organization owners can view all audit logs for their org"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN organizations ON users.org_id = organizations.id
      WHERE users.id = audit_logs.user_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view audit logs for their organization"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS current_user
      JOIN users AS log_user ON current_user.org_id = log_user.org_id
      WHERE current_user.id = auth.uid()
      AND current_user.role = 'Manager'
      AND log_user.id = audit_logs.user_id
    )
  );

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;