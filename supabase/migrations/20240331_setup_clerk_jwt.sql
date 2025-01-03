-- Create the auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the jwt verification function
CREATE OR REPLACE FUNCTION auth.verify_jwt() RETURNS void AS $$
DECLARE
  jwt_role text;
  jwt_sub text;
BEGIN
  -- Get the JWT claims
  jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
  jwt_sub := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- Verify the JWT is present and has required claims
  IF jwt_role IS NULL OR jwt_sub IS NULL THEN
    RAISE EXCEPTION 'Invalid JWT token';
  END IF;
  
  -- Set the role for the current session
  EXECUTE format('SET LOCAL ROLE %I', jwt_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to verify JWT on every request
CREATE OR REPLACE FUNCTION auth.verify_jwt_trigger() RETURNS trigger AS $$
BEGIN
  PERFORM auth.verify_jwt();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable the trigger on the prompt_history table
DROP TRIGGER IF EXISTS verify_jwt_trigger ON public.prompt_history;
CREATE TRIGGER verify_jwt_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.prompt_history
  FOR EACH STATEMENT
  EXECUTE FUNCTION auth.verify_jwt_trigger();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.verify_jwt TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.verify_jwt_trigger TO anon, authenticated; 