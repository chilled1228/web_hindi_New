-- Rename the column to reflect daily limit
ALTER TABLE public.users 
RENAME COLUMN monthly_prompt_limit TO daily_prompt_limit;

-- Update all users to new daily limit
UPDATE public.users
SET daily_prompt_limit = 10;

-- Set new default for daily limit
ALTER TABLE public.users 
ALTER COLUMN daily_prompt_limit 
SET DEFAULT 10;

-- Update the check_and_track_prompt_usage function for daily limits
CREATE OR REPLACE FUNCTION public.check_and_track_prompt_usage(
  user_id_param UUID,
  start_date_param TIMESTAMPTZ,
  prompt_type_param TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_limit INTEGER;
  used_count INTEGER;
  result jsonb;
BEGIN
  -- Get user's daily limit
  SELECT daily_prompt_limit INTO user_limit
  FROM public.users
  WHERE id = user_id_param;

  IF user_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'used_prompts', 0,
      'prompt_limit', 0
    );
  END IF;

  -- Get current usage count for today
  SELECT COUNT(*) INTO used_count
  FROM public.prompt_usage
  WHERE user_id = user_id_param
  AND used_at >= DATE_TRUNC('day', NOW());

  -- Check if user has reached their daily limit
  IF used_count >= user_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily limit reached',
      'used_prompts', used_count,
      'prompt_limit', user_limit
    );
  END IF;

  -- Insert new usage record
  INSERT INTO public.prompt_usage (user_id, prompt_type)
  VALUES (user_id_param, prompt_type_param);

  -- Return success result with updated counts
  RETURN jsonb_build_object(
    'success', true,
    'used_prompts', used_count + 1,
    'prompt_limit', user_limit
  );
END;
$$; 