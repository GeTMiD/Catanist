-- Backfill any rows that were inserted before this constraint.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
