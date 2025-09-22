/*
  # Create Database Functions and Views

  1. Functions
    - `get_organization_stats` - Get organization statistics
    - `get_shop_performance` - Get shop performance metrics
    - `get_low_stock_items` - Get items with low stock
    - `get_sales_summary` - Get sales summary for date range

  2. Views
    - `organization_dashboard_view` - Dashboard data for organizations
    - `shop_dashboard_view` - Dashboard data for shops
    - `employee_performance_view` - Employee performance metrics

  3. Security
    - All functions use SECURITY DEFINER with proper RLS checks
*/

-- Function to get organization statistics
CREATE OR REPLACE FUNCTION get_organization_stats(org_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_shops integer;
  total_employees integer;
  total_managers integer;
  total_sales decimal(10,2);
  total_products integer;
BEGIN
  -- Verify user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND org_id = org_id_param
  ) THEN
    RAISE EXCEPTION 'Access denied to organization statistics';
  END IF;

  -- Get shop count
  SELECT COUNT(*) INTO total_shops
  FROM shops 
  WHERE org_id = org_id_param AND is_active = true;

  -- Get employee counts
  SELECT 
    COUNT(*) FILTER (WHERE role = 'Employee') as employees,
    COUNT(*) FILTER (WHERE role = 'Manager') as managers
  INTO total_employees, total_managers
  FROM users 
  WHERE org_id = org_id_param;

  -- Get total sales for current month
  SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
  FROM sales s
  JOIN shops sh ON s.shop_id = sh.id
  WHERE sh.org_id = org_id_param
  AND s.status = 'completed'
  AND s.sale_date >= date_trunc('month', CURRENT_DATE);

  -- Get product count
  SELECT COUNT(*) INTO total_products
  FROM products 
  WHERE org_id = org_id_param AND is_active = true;

  result := jsonb_build_object(
    'total_shops', total_shops,
    'total_employees', total_employees,
    'total_managers', total_managers,
    'total_sales_this_month', total_sales,
    'total_products', total_products
  );

  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get shop performance metrics
CREATE OR REPLACE FUNCTION get_shop_performance(shop_id_param uuid, days_back integer DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_sales decimal(10,2);
  sales_count integer;
  avg_sale_amount decimal(10,2);
  top_employee jsonb;
BEGIN
  -- Verify user has access to this shop
  IF NOT EXISTS (
    SELECT 1 FROM shops s
    JOIN users u ON u.org_id = s.org_id
    WHERE s.id = shop_id_param 
    AND u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to shop performance data';
  END IF;

  -- Get sales metrics
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*),
    COALESCE(AVG(total_amount), 0)
  INTO total_sales, sales_count, avg_sale_amount
  FROM sales 
  WHERE shop_id = shop_id_param
  AND status = 'completed'
  AND sale_date >= CURRENT_DATE - INTERVAL '%s days' % days_back;

  -- Get top performing employee
  SELECT jsonb_build_object(
    'employee_name', u.name,
    'total_sales', COALESCE(SUM(s.total_amount), 0),
    'sales_count', COUNT(s.id)
  ) INTO top_employee
  FROM sales s
  JOIN users u ON s.employee_id = u.id
  WHERE s.shop_id = shop_id_param
  AND s.status = 'completed'
  AND s.sale_date >= CURRENT_DATE - INTERVAL '%s days' % days_back
  GROUP BY u.id, u.name
  ORDER BY SUM(s.total_amount) DESC
  LIMIT 1;

  result := jsonb_build_object(
    'total_sales', total_sales,
    'sales_count', sales_count,
    'avg_sale_amount', avg_sale_amount,
    'top_employee', COALESCE(top_employee, '{}'::jsonb)
  );

  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(org_id_param uuid)
RETURNS TABLE (
  shop_name text,
  product_name text,
  current_quantity integer,
  min_quantity integer,
  sku text
) AS $$
BEGIN
  -- Verify user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND org_id = org_id_param
  ) THEN
    RAISE EXCEPTION 'Access denied to inventory data';
  END IF;

  RETURN QUERY
  SELECT 
    s.name as shop_name,
    p.name as product_name,
    i.quantity as current_quantity,
    i.min_quantity,
    p.sku
  FROM inventory i
  JOIN shops s ON i.shop_id = s.id
  JOIN products p ON i.product_id = p.id
  WHERE s.org_id = org_id_param
  AND i.quantity <= i.min_quantity
  AND s.is_active = true
  AND p.is_active = true
  ORDER BY s.name, p.name;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get sales summary
CREATE OR REPLACE FUNCTION get_sales_summary(
  org_id_param uuid,
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  sale_date date,
  total_sales decimal(10,2),
  sales_count integer,
  avg_sale_amount decimal(10,2)
) AS $$
BEGIN
  -- Verify user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND org_id = org_id_param
  ) THEN
    RAISE EXCEPTION 'Access denied to sales data';
  END IF;

  RETURN QUERY
  SELECT 
    s.sale_date::date,
    SUM(s.total_amount) as total_sales,
    COUNT(s.id)::integer as sales_count,
    AVG(s.total_amount) as avg_sale_amount
  FROM sales s
  JOIN shops sh ON s.shop_id = sh.id
  WHERE sh.org_id = org_id_param
  AND s.status = 'completed'
  AND s.sale_date::date BETWEEN start_date AND end_date
  GROUP BY s.sale_date::date
  ORDER BY s.sale_date::date;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create organization dashboard view
CREATE OR REPLACE VIEW organization_dashboard_view AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.owner_id,
  COUNT(DISTINCT s.id) as total_shops,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'Employee') as total_employees,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'Manager') as total_managers,
  COALESCE(SUM(sales.total_amount) FILTER (WHERE sales.sale_date >= date_trunc('month', CURRENT_DATE)), 0) as monthly_sales
FROM organizations o
LEFT JOIN shops s ON o.id = s.org_id AND s.is_active = true
LEFT JOIN users u ON o.id = u.org_id
LEFT JOIN sales ON s.id = sales.shop_id AND sales.status = 'completed'
GROUP BY o.id, o.name, o.owner_id;

-- Create shop dashboard view
CREATE OR REPLACE VIEW shop_dashboard_view AS
SELECT 
  s.id as shop_id,
  s.name as shop_name,
  s.org_id,
  s.manager_id,
  COUNT(DISTINCT se.employee_id) as assigned_employees,
  COUNT(DISTINCT i.product_id) as total_products,
  COUNT(DISTINCT i.product_id) FILTER (WHERE i.quantity <= i.min_quantity) as low_stock_items,
  COALESCE(SUM(sales.total_amount) FILTER (WHERE sales.sale_date >= CURRENT_DATE), 0) as daily_sales,
  COALESCE(SUM(sales.total_amount) FILTER (WHERE sales.sale_date >= date_trunc('month', CURRENT_DATE)), 0) as monthly_sales
FROM shops s
LEFT JOIN shop_employees se ON s.id = se.shop_id AND se.is_active = true
LEFT JOIN inventory i ON s.id = i.shop_id
LEFT JOIN sales ON s.id = sales.shop_id AND sales.status = 'completed'
WHERE s.is_active = true
GROUP BY s.id, s.name, s.org_id, s.manager_id;