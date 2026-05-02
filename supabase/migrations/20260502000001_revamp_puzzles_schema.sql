-- Add game-mechanics columns and fix creator_user type.
-- puzzles table was empty at migration time so the uuid cast is safe.

-- Change creator_user from text to uuid referencing profiles
ALTER TABLE public.puzzles
    ALTER COLUMN creator_user TYPE uuid USING creator_user::uuid;

ALTER TABLE public.puzzles
    ADD CONSTRAINT puzzles_creator_fkey
    FOREIGN KEY (creator_user) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Game mechanics columns
ALTER TABLE public.puzzles
    ADD COLUMN IF NOT EXISTS choices text[],
    ADD COLUMN IF NOT EXISTS correct_choice smallint DEFAULT 0,
    ADD COLUMN IF NOT EXISTS target_points smallint,
    ADD COLUMN IF NOT EXISTS move_limit smallint,
    -- board_layout stores the full hex grid state.
    -- Schema: { tiles: [{q, r, terrain, number}], settlements: [{q, r, vertex, player, type}],
    --           roads: [{q, r, edge, player}], robber: {q, r}, ports: [{q, r, type, edge}] }
    -- All coordinates are axial (q, r) — consistent with honeycomb-grid defaults.
    ADD COLUMN IF NOT EXISTS board_layout jsonb;

ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view puzzles"
    ON public.puzzles FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create puzzles"
    ON public.puzzles FOR INSERT TO authenticated WITH CHECK (creator_user = auth.uid());

CREATE POLICY "Creators can update own puzzles"
    ON public.puzzles FOR UPDATE TO authenticated USING (creator_user = auth.uid());

CREATE POLICY "Creators can delete own puzzles"
    ON public.puzzles FOR DELETE TO authenticated USING (creator_user = auth.uid());
