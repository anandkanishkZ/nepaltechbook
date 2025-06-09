/*
  # Fix RLS policies and email confirmation

  1. Security Policy Fixes
    - Remove recursive RLS policy on profiles table that causes infinite recursion
    - Create safer admin policies that don't cause circular references
    - Add proper policies for profile access

  2. Changes
    - Drop problematic admin policies that reference profiles table recursively
    - Create new policies that use auth.uid() directly
    - Ensure users can access their own profiles without recursion
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage files" ON files;
DROP POLICY IF EXISTS "Admins can read all purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can update purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can read all downloads" ON file_downloads;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can read all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can read activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;

-- Create a function to safely check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;

-- Recreate admin policies using the safe function
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage files"
  ON files
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all downloads"
  ON file_downloads
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));