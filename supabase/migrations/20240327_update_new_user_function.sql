-- Update the handle_new_user function to include daily_prompt_limit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, daily_prompt_limit)
  VALUES (new.id, new.email, 10);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 