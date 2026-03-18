-- ============================================
-- Mercor Japan - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles (extends Supabase auth.users) ───
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'company')),
  avatar_url TEXT,
  title TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Companies ───
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  logo_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Jobs ───
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  work_style TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  commitment TEXT,
  min_rate INTEGER NOT NULL,
  max_rate INTEGER NOT NULL,
  requirements TEXT,
  preferred TEXT,
  benefits TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'closed')),
  applicant_count INTEGER DEFAULT 0,
  hired_count INTEGER DEFAULT 0,
  referral_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Applications ───
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'screening', 'interview', 'offered', 'rejected', 'accepted')),
  motivation TEXT,
  desired_rate INTEGER,
  start_date TEXT,
  resume_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- ─── Contracts ───
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rate INTEGER NOT NULL,
  hours_per_week INTEGER NOT NULL,
  commitment TEXT NOT NULL,
  work_style TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Offers ───
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  message TEXT,
  rate INTEGER NOT NULL,
  commitment TEXT,
  work_style TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Timesheets ───
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Assessments ───
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  score INTEGER,
  max_score INTEGER DEFAULT 100,
  duration_minutes INTEGER DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Saved Jobs ───
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ─── Notifications ───
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Experiences ───
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  skills TEXT[],
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Education ───
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  period TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Skills ───
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Earnings ───
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'processing', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Payment Info ───
CREATE TABLE payment_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT,
  branch_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chat Messages ───
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'support')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: viewable by all, editable by owner
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);
CREATE POLICY "Company owners can insert" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Company owners can update" ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Company owners can delete" ON companies FOR DELETE USING (auth.uid() = user_id);

-- Jobs: viewable by all, editable by company owner
CREATE POLICY "Published jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Company can insert jobs" ON jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Company can update jobs" ON jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Company can delete jobs" ON jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);

-- Applications: viewable by applicant and company, insertable by worker
CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can view applications to their jobs" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = job_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);

-- Contracts: viewable by worker and company
CREATE POLICY "Workers can view own contracts" ON contracts FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Companies can view own contracts" ON contracts FOR SELECT USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Companies can insert contracts" ON contracts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Companies can update contracts" ON contracts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);

-- Offers: viewable by worker and company
CREATE POLICY "Workers can view own offers" ON offers FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Companies can view own offers" ON offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Companies can insert offers" ON offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Workers can update offer status" ON offers FOR UPDATE USING (auth.uid() = worker_id);

-- Timesheets: viewable by worker, insertable by worker
CREATE POLICY "Users can view own timesheets" ON timesheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert timesheets" ON timesheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timesheets" ON timesheets FOR UPDATE USING (auth.uid() = user_id);

-- Assessments: own only
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert assessments" ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON assessments FOR UPDATE USING (auth.uid() = user_id);

-- Saved jobs: own only
CREATE POLICY "Users can view own saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Notifications: own only
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Experiences, Education, Skills: own only
CREATE POLICY "Users can view own experiences" ON experiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own experiences" ON experiences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own education" ON education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own education" ON education FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skills" ON skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON skills FOR ALL USING (auth.uid() = user_id);

-- Earnings: own only
CREATE POLICY "Users can view own earnings" ON earnings FOR SELECT USING (auth.uid() = user_id);

-- Payment info: own only
CREATE POLICY "Users can view own payment info" ON payment_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment info" ON payment_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment info" ON payment_info FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages: own only
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payment_info_updated_at BEFORE UPDATE ON payment_info FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment applicant_count on new application
CREATE OR REPLACE FUNCTION increment_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET applicant_count = applicant_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION increment_applicant_count();

-- ============================================
-- Storage Buckets (run in Supabase dashboard)
-- ============================================
-- CREATE POLICY for storage.objects:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
