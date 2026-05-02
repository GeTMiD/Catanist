-- Replaces public.users with a proper profile table linked to Supabase Auth.
-- Passwords and sessions are handled entirely by auth.users — never stored here.
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    username text,
    is_premium boolean DEFAULT false NOT NULL,
    score bigint DEFAULT 0 NOT NULL,
    puzzles_created bigint DEFAULT 0 NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
    ON public.profiles FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
