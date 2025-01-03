-- Drop the prompt usage function
DROP FUNCTION IF EXISTS public.check_and_track_prompt_usage;
DROP FUNCTION IF EXISTS public.increment_prompt_usage;

-- Drop the prompt usage table
DROP TABLE IF EXISTS public.prompt_usage;

-- Remove the monthly_prompt_limit column from users table if it exists
ALTER TABLE IF EXISTS public.users 
DROP COLUMN IF EXISTS monthly_prompt_limit; 