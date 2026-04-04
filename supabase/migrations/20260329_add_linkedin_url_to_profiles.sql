-- Add linkedin_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
