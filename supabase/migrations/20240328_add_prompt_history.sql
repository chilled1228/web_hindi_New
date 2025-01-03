-- Create prompt_history table
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  prompt_type TEXT NOT NULL,
  input_image TEXT,
  output_text TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own prompt history
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own prompt history
CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
  FOR INSERT WITH CHECK (auth.uid() = user_id); 