-- ============================================================
-- MediPulse AI — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('CBC', 'LIPID', 'THYROID', 'METABOLIC', 'LFT_KFT')),
  report_date DATE NOT NULL,
  lab_name TEXT DEFAULT 'Unknown Lab',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Biomarkers table
CREATE TABLE IF NOT EXISTS public.biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  ref_min NUMERIC,
  ref_max NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('NORMAL', 'BORDERLINE', 'OUT_OF_RANGE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reports: users can only CRUD their own reports
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_delete_own" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Biomarkers: users can only access biomarkers from their own reports
CREATE POLICY "biomarkers_select_own" ON public.biomarkers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = biomarkers.report_id
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "biomarkers_insert_own" ON public.biomarkers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = biomarkers.report_id
      AND reports.user_id = auth.uid()
    )
  );

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_biomarkers_report_id ON public.biomarkers(report_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_name ON public.biomarkers(name);
CREATE INDEX IF NOT EXISTS idx_biomarkers_status ON public.biomarkers(status);

-- ============================================================
-- Migration: Profile Settings & Avatar Storage
-- ============================================================

-- Add avatar_url and theme_preference columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark'
    CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Storage: avatars bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatar storage bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;
CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
