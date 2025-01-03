-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own prompt usage" ON public.prompt_usage;
DROP POLICY IF EXISTS "Users can insert own prompt usage" ON public.prompt_usage;

-- Drop existing table and related objects
DROP TABLE IF EXISTS public.prompt_usage CASCADE;

-- Create prompt_usage table with correct structure
CREATE TABLE public.prompt_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  prompt_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT prompt_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompt_usage_user_date ON public.prompt_usage(user_id, used_at);

-- Enable RLS
ALTER TABLE public.prompt_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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