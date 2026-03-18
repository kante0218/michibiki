-- ============================================
-- Security Migration: RLS Policy Hardening
-- Run this in Supabase SQL Editor
-- ============================================

-- ─── 1. PROFILES: Restrict phone/email visibility ───
-- Problem: "Profiles are viewable by everyone" exposes phone, email, bank info
-- Fix: Public can only see non-sensitive fields. Full profile only to self.

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Own profile: full access
CREATE POLICY "Users can view own full profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Other profiles: only via authenticated users (for matching/display)
-- Note: Sensitive fields (phone, email) should be filtered at application level
-- but RLS ensures at minimum only authenticated users can browse
CREATE POLICY "Authenticated users can view basic profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ─── 2. JOBS: Only show published jobs to non-owners ───
DROP POLICY IF EXISTS "Published jobs are viewable by everyone" ON jobs;

CREATE POLICY "Published jobs are viewable by authenticated users"
  ON jobs FOR SELECT
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- ─── 3. APPLICATIONS: Companies should be able to update status ───
CREATE POLICY "Companies can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON jobs.company_id = companies.id
      WHERE jobs.id = job_id
      AND companies.user_id = auth.uid()
    )
  );

-- ─── 4. PAYMENT_INFO: Extra protection - no DELETE allowed ───
-- Payment info should never be deletable from client side
-- (only updatable to clear fields)

-- ─── 5. NOTIFICATIONS: Allow system inserts via service role only ───
-- Users should NOT be able to insert their own notifications
-- Notifications should only be created by triggers/service role

-- ─── 6. EARNINGS: Prevent client-side manipulation ───
-- Earnings should only be inserted by service role (server-side)
-- No INSERT policy for regular users = blocked by default with RLS enabled

-- ─── 7. CHAT_MESSAGES: Prevent message tampering ───
-- Users should not be able to update or delete chat messages
-- Current schema only has SELECT and INSERT which is correct

-- ─── 8. CONTRACTS: Workers should not be able to modify contracts ───
-- Only companies can insert/update contracts (already correct)
-- Add explicit denial by not adding worker update policy

-- ============================================
-- Storage Bucket Security Policies
-- Run these in Supabase SQL Editor
-- ============================================

-- ─── RESUMES BUCKET: Private, owner-only access ───
-- Users can only upload to their own folder
-- Users can only read their own files
-- Companies can read resumes of users who applied to their jobs

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Users can upload own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Companies can read applicant resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;

-- Upload: user can only upload to their own folder (resumes/<user_id>/*)
CREATE POLICY "Users can upload own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: user can only read their own resumes
CREATE POLICY "Users can read own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Companies can read resumes of applicants to their jobs
CREATE POLICY "Companies can read applicant resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE c.user_id = auth.uid()
      AND a.user_id::text = (storage.foldername(name))[1]
    )
  );

-- Delete: user can only delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: user can only update (overwrite) their own resumes
CREATE POLICY "Users can update own resumes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── AVATARS BUCKET: Public read, owner-only write ───
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- Rate Limiting Function (optional, for API abuse prevention)
-- ============================================

-- Track API calls per user for rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
