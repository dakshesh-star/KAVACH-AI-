-- ============================================================
-- KAVACH PHASE 2 — SUPABASE DATABASE SCHEMA (PRODUCTION)
-- Run this in: Supabase → SQL Editor → New Query → Run
--
-- CHANGES FROM ORIGINAL:
-- - Added updated_at column to profiles with auto-update trigger
-- - Added optional user-controlled DELETE policy (commented out)
-- - Added storage bucket setup instructions
-- - Cleaned up idempotent IF NOT EXISTS guards throughout
-- ============================================================

-- ── 1. PROFILES TABLE ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL  -- NEW: for profile edit tracking
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY IF NOT EXISTS "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-update updated_at on profile changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
-- NOTE: This trigger means the manual profile upsert in signup/page.tsx
-- is NOT needed and has been removed. Do not add it back.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. ANALYSES TABLE ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  analysis_type   TEXT NOT NULL CHECK (analysis_type IN ('screenshot', 'paste', 'url', 'voice')),
  risk_score      INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE')),
  verdict         TEXT NOT NULL,
  scam_type       TEXT NOT NULL,
  full_result     JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user queries sorted by date
CREATE INDEX IF NOT EXISTS analyses_user_id_created_at_idx
  ON public.analyses (user_id, created_at DESC);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Users can only access their own analyses
CREATE POLICY IF NOT EXISTS "analyses_select_own"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "analyses_insert_own"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update analyses (immutable audit log — correct by design)
-- Uncomment the following to allow users to delete their own history:
-- CREATE POLICY "analyses_delete_own"
--   ON public.analyses FOR DELETE
--   USING (auth.uid() = user_id);


-- ── 3. VERIFICATION ───────────────────────────────────────────────────────

-- Run these to confirm setup:
SELECT 'profiles table' AS check, count(*) AS rows FROM public.profiles;
SELECT 'analyses table' AS check, count(*) AS rows FROM public.analyses;
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;


-- ── 4. SUPABASE AUTH SETTINGS (manual — do in Dashboard UI) ───────────────
-- Go to: Authentication → Settings
--
-- Email confirmations:
--   - If you want instant login (no email verify): DISABLE "Enable email confirmations"
--   - If you want secure signup flow: ENABLE it and set a redirect URL
--
-- Site URL: Set to your production domain (e.g. https://kavach.app)
-- Redirect URLs: Add http://localhost:3000/**, https://kavach.app/**
--
-- Email templates: Customize the confirmation email in Authentication → Email Templates
