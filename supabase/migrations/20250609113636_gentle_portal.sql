/*
  # Fix infinite recursion in profiles RLS policy

  1. Security Changes
    - Drop the problematic "Admins can read all profiles" policy that causes infinite recursion
    - Create a new admin policy that uses auth.jwt() to check admin status without querying profiles table
    - Keep existing user policies intact

  The issue was that the admin policy was querying the profiles table to check if a user is admin,
  which triggered the same policy check recursively. The new policy uses the JWT token data instead.
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a new admin policy that doesn't cause recursion
-- This uses the auth.jwt() function to check claims in the JWT token
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'is_admin')::boolean,
      false
    ) = true
    OR
    uid() = id
  );