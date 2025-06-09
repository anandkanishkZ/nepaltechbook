/*
  # Enhanced Admin Panel Database Schema

  1. New Tables
    - Enhanced `profiles` table with additional admin fields
    - `invoices` table for invoice management
    - `user_sessions` table for session tracking
    - `system_settings` table for configuration
    - `activity_logs` table for audit trail
    - `email_templates` table for automated emails

  2. Enhanced Features
    - Advanced user management
    - Invoice generation system
    - Activity logging
    - System configuration
    - Email template management

  3. Security
    - Enhanced RLS policies
    - Admin-only access controls
    - Audit trail functionality
*/

-- Add additional columns to profiles table
DO $$
BEGIN
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;

  -- Add last_login column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  due_date timestamptz,
  sent_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create file_downloads table to track downloads
CREATE TABLE IF NOT EXISTS file_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE,
  download_count integer DEFAULT 1,
  last_downloaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- User sessions policies
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- System settings policies
CREATE POLICY "Admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can read activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Email templates policies
CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- File downloads policies
CREATE POLICY "Users can read own downloads"
  ON file_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own downloads"
  ON file_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all downloads"
  ON file_downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add updated_at triggers for new tables
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  invoice_number text;
BEGIN
  -- Get the next invoice number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number ~ '^INV-\d+$';
  
  -- Format as INV-000001
  invoice_number := 'INV-' || LPAD(next_number::text, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create invoice from purchase
CREATE OR REPLACE FUNCTION create_invoice_from_purchase(purchase_uuid uuid)
RETURNS uuid AS $$
DECLARE
  invoice_uuid uuid;
  purchase_record purchases%ROWTYPE;
BEGIN
  -- Get purchase details
  SELECT * INTO purchase_record
  FROM purchases
  WHERE id = purchase_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found';
  END IF;
  
  -- Create invoice
  INSERT INTO invoices (
    invoice_number,
    purchase_id,
    user_id,
    amount,
    tax_amount,
    total_amount,
    status,
    due_date
  ) VALUES (
    generate_invoice_number(),
    purchase_record.id,
    purchase_record.user_id,
    purchase_record.amount,
    purchase_record.amount * 0.13, -- 13% tax
    purchase_record.amount * 1.13,
    'sent',
    now() + interval '30 days'
  ) RETURNING id INTO invoice_uuid;
  
  RETURN invoice_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
  ('site_name', '"FileMarket"', 'Name of the website', 'general'),
  ('site_description', '"Premium digital file marketplace"', 'Description of the website', 'general'),
  ('contact_email', '"admin@filemarket.com"', 'Contact email address', 'general'),
  ('contact_phone', '"+1 234 567 8910"', 'Contact phone number', 'general'),
  ('contact_address', '"123 Market Street, Suite 456, New York, NY 10001"', 'Contact address', 'general'),
  ('enable_esewa', 'true', 'Enable eSewa payment gateway', 'payment'),
  ('enable_khalti', 'true', 'Enable Khalti payment gateway', 'payment'),
  ('enable_imepay', 'true', 'Enable IME Pay payment gateway', 'payment'),
  ('auto_approve_payments', 'false', 'Automatically approve payments', 'payment'),
  ('smtp_server', '"smtp.gmail.com"', 'SMTP server for email', 'email'),
  ('smtp_port', '587', 'SMTP port', 'email'),
  ('smtp_username', '""', 'SMTP username', 'email'),
  ('smtp_password', '""', 'SMTP password', 'email'),
  ('send_welcome_emails', 'true', 'Send welcome emails to new users', 'email'),
  ('require_email_verification', 'true', 'Require email verification for new accounts', 'security'),
  ('enable_2fa', 'false', 'Enable two-factor authentication', 'security'),
  ('session_timeout', '60', 'Session timeout in minutes', 'security'),
  ('max_download_attempts', '5', 'Maximum download attempts per file', 'security')
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, variables, body) VALUES
  (
    'welcome_email',
    'Welcome to FileMarket!',
    '["user_name", "site_name"]',
    'Hello {{user_name}},

Welcome to {{site_name}}! We''re excited to have you join our community.

You can now browse and download high-quality digital files from our marketplace.

Best regards,
The FileMarket Team'
  ),
  (
    'purchase_confirmation',
    'Purchase Confirmation - {{file_title}}',
    '["user_name", "file_title", "amount", "download_link"]',
    'Hello {{user_name}},

Thank you for your purchase! Your payment has been processed successfully.

File: {{file_title}}
Amount: ${{amount}}

You can download your file using the link below:
{{download_link}}

Best regards,
The FileMarket Team'
  ),
  (
    'invoice_email',
    'Invoice {{invoice_number}} - FileMarket',
    '["user_name", "invoice_number", "amount", "due_date"]',
    'Hello {{user_name}},

Please find your invoice attached.

Invoice Number: {{invoice_number}}
Amount: ${{amount}}
Due Date: {{due_date}}

Thank you for your business!

Best regards,
The FileMarket Team'
  )
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_purchase_id ON invoices(purchase_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login);

-- Create view for dashboard analytics
CREATE OR REPLACE VIEW dashboard_analytics AS
SELECT
  (SELECT COUNT(*) FROM files) as total_files,
  (SELECT COUNT(*) FROM profiles WHERE is_admin = false) as total_users,
  (SELECT COUNT(*) FROM purchases) as total_purchases,
  (SELECT COUNT(*) FROM purchases WHERE status = 'pending') as pending_purchases,
  (SELECT COUNT(*) FROM purchases WHERE status = 'approved') as approved_purchases,
  (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE status = 'approved') as total_revenue,
  (SELECT COUNT(*) FROM file_downloads) as total_downloads,
  (SELECT COUNT(*) FROM files WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as files_this_week,
  (SELECT COUNT(*) FROM purchases WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as purchases_this_week,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as users_this_week;

-- Grant access to the analytics view for authenticated users
GRANT SELECT ON dashboard_analytics TO authenticated;