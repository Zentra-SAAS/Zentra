/*
  # Create Shop Employees Junction Table

  1. New Tables
    - `shop_employees`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, references shops)
      - `employee_id` (uuid, references users)
      - `assigned_at` (timestamp)
      - `is_active` (boolean, assignment status)

  2. Security
    - Enable RLS on `shop_employees` table
    - Add policy for organization owners to manage assignments
    - Add policy for managers to manage assignments in their shops
    - Add policy for employees to read their own assignments

  3. Constraints
    - Unique constraint on shop_id + employee_id combination
    - Check constraint to ensure only Employees can be assigned
*/

CREATE TABLE IF NOT EXISTS shop_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(shop_id, employee_id)
);

-- Enable RLS
ALTER TABLE shop_employees ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS shop_employees_shop_id_idx ON shop_employees(shop_id);
CREATE INDEX IF NOT EXISTS shop_employees_employee_id_idx ON shop_employees(employee_id);
CREATE INDEX IF NOT EXISTS shop_employees_is_active_idx ON shop_employees(is_active);

-- RLS Policies
CREATE POLICY "Organization owners can manage shop employee assignments"
  ON shop_employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      JOIN organizations ON shops.org_id = organizations.id
      WHERE shops.id = shop_employees.shop_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage assignments in their shops"
  ON shop_employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_employees.shop_id 
      AND (
        shops.manager_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.org_id = shops.org_id 
          AND users.role = 'Manager'
        )
      )
    )
  );

CREATE POLICY "Employees can read their own shop assignments"
  ON shop_employees
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- Function to validate employee assignment
CREATE OR REPLACE FUNCTION validate_employee_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the employee is actually an Employee role
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = NEW.employee_id 
    AND users.role = 'Employee'
  ) THEN
    RAISE EXCEPTION 'Only users with Employee role can be assigned to shops';
  END IF;
  
  -- Ensure the employee belongs to the same organization as the shop
  IF NOT EXISTS (
    SELECT 1 FROM users 
    JOIN shops ON users.org_id = shops.org_id
    WHERE users.id = NEW.employee_id 
    AND shops.id = NEW.shop_id
  ) THEN
    RAISE EXCEPTION 'Employee must belong to the same organization as the shop';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate employee assignment
CREATE TRIGGER validate_employee_assignment_trigger
  BEFORE INSERT OR UPDATE ON shop_employees
  FOR EACH ROW
  EXECUTE FUNCTION validate_employee_assignment();