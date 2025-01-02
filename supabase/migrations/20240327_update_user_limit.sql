-- Update existing users to new limit
UPDATE public.users
SET monthly_prompt_limit = 5
WHERE monthly_prompt_limit != 5;

-- Modify the default value for new users
ALTER TABLE public.users 
ALTER COLUMN monthly_prompt_limit 
SET DEFAULT 5; 