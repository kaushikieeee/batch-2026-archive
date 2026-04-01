ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS x_twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS visibility_preferences JSONB DEFAULT '{"email": true, "phone": true, "instagram": true, "linkedin": true, "youtube": true, "github": true, "x_twitter": true, "website": true, "dob": true}'::jsonb;
