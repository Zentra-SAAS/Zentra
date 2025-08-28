/*
  # Create Database Functions and Triggers

  1. Functions
    - Update timestamp function for updated_at columns
    - Organization statistics function

  2. Triggers
    - Auto-update timestamps
    - Maintain data consistency

  3. Additional Constraints
    - Ensure data integrity
*/

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for products table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_products_updated_at'
    ) THEN
        CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to get organization statistics
CREATE OR REPLACE FUNCTION get_organization_stats(org_uuid uuid)
RETURNS TABLE(
    total_shops bigint,
    total_employees bigint,
    total_managers bigint,
    total_sales_today decimal,
    total_products bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM shops WHERE org_id = org_uuid AND is_active = true),
        (SELECT COUNT(*) FROM users WHERE org_id = org_uuid AND role != 'Owner'),
        (SELECT COUNT(*) FROM users WHERE org_id = org_uuid AND role = 'Manager'),
        (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE org_id = org_uuid AND DATE(transaction_date) = CURRENT_DATE),
        (SELECT COUNT(*) FROM products WHERE org_id = org_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_organization_stats(uuid) TO authenticated;

-- Add some additional constraints for data integrity
DO $$
BEGIN
    -- Ensure organization codes are uppercase and alphanumeric
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organizations_org_code_format'
    ) THEN
        ALTER TABLE organizations 
        ADD CONSTRAINT organizations_org_code_format 
        CHECK (org_code ~ '^[A-Z0-9]+$' AND length(org_code) >= 10);
    END IF;

    -- Ensure passkeys are uppercase and alphanumeric
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organizations_passkey_format'
    ) THEN
        ALTER TABLE organizations 
        ADD CONSTRAINT organizations_passkey_format 
        CHECK (passkey ~ '^[A-Z0-9]+$' AND length(passkey) >= 10);
    END IF;

    -- Ensure email format in users table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_format'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;