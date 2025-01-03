-- Drop ALL existing RLS policies on prompt_usage
DROP POLICY IF EXISTS "Users can view own prompt usage" ON prompt_usage;
DROP POLICY IF EXISTS "Users can insert own prompt usage" ON prompt_usage;
DROP POLICY IF EXISTS "Users can track own prompt usage" ON prompt_usage;
DROP POLICY IF EXISTS "Users can delete own prompt usage" ON prompt_usage;
DROP POLICY IF EXISTS "Users can update own prompt usage" ON prompt_usage;

-- Temporarily disable RLS
ALTER TABLE prompt_usage DISABLE ROW LEVEL SECURITY;

-- First, create a backup of existing prompt_usage data
CREATE TABLE IF NOT EXISTS prompt_usage_backup AS SELECT * FROM prompt_usage;

-- Add clerk_user_id column to users table and copy existing user IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
UPDATE users SET clerk_user_id = id::text WHERE clerk_user_id IS NULL;

-- Drop existing foreign key and constraints
ALTER TABLE prompt_usage DROP CONSTRAINT IF EXISTS prompt_usage_user_id_fkey;

-- Update prompt_usage table to use text and update existing records
ALTER TABLE prompt_usage ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- Update existing prompt_usage records to use clerk_user_id
UPDATE prompt_usage pu
SET user_id = u.clerk_user_id
FROM users u
WHERE pu.user_id::text = u.id::text;

-- Create foreign key constraint
ALTER TABLE prompt_usage
  ADD CONSTRAINT prompt_usage_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(clerk_user_id)
  ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for Clerk users
CREATE POLICY "Users can view own prompt usage"
ON prompt_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_user_id = prompt_usage.user_id
  )
);

CREATE POLICY "Users can insert own prompt usage"
ON prompt_usage FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_user_id = prompt_usage.user_id
  )
); 