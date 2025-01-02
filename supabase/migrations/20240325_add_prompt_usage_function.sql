-- Function to check and track prompt usage in a single transaction
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
  -- Get user's monthly limit
  SELECT monthly_prompt_limit INTO user_limit
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

  -- Get current usage count within transaction
  SELECT COUNT(*) INTO used_count
  FROM public.prompt_usage
  WHERE user_id = user_id_param
  AND used_at >= start_date_param;

  -- Check if user has reached their limit
  IF used_count >= user_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Monthly limit reached',
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