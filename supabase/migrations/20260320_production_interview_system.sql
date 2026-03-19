-- =============================================
-- 本番面接システム: 企業カスタム問題 + 候補者分析
-- =============================================

-- 1. job_postings テーブルに面接設定カラムを追加
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS interview_difficulty TEXT DEFAULT 'intermediate';
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS interview_topics TEXT[] DEFAULT '{}';
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS interview_question_count INTEGER DEFAULT 5;
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS interview_custom_instructions TEXT DEFAULT '';
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS interview_duration_minutes INTEGER DEFAULT 20;

-- 2. 本番面接テーブル
CREATE TABLE IF NOT EXISTS production_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  -- 生成された問題と回答
  questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  -- 面接の会話ログ
  conversation_log JSONB DEFAULT '[]',
  -- 録画情報
  recording_path TEXT,
  recording_duration_seconds NUMERIC(10,2),
  speech_segments JSONB DEFAULT '[]',
  -- タイムスタンプ
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 一人の候補者は一つの求人に対して一度だけ本番面接可能
  UNIQUE(candidate_id, job_posting_id)
);

-- 3. 面接分析結果テーブル（候補者には非表示）
CREATE TABLE IF NOT EXISTS interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_interview_id UUID NOT NULL REFERENCES production_interviews(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- スコア (0-100)
  overall_score NUMERIC(5,2),
  technical_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  appearance_score NUMERIC(5,2),
  problem_solving_score NUMERIC(5,2),
  -- 正答率
  correct_rate NUMERIC(5,2),
  -- マッチング度合い (0-100)
  matching_score NUMERIC(5,2),
  -- AI分析
  ai_analysis TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendation TEXT,
  -- 送信状態
  sent_to_company BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_production_interviews_candidate ON production_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_production_interviews_company ON production_interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_production_interviews_job ON production_interviews(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_production_interviews_status ON production_interviews(status);
CREATE INDEX IF NOT EXISTS idx_interview_results_company ON interview_results(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_candidate ON interview_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_job ON interview_results(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_matching ON interview_results(matching_score DESC);

-- RLS ポリシー
ALTER TABLE production_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_results ENABLE ROW LEVEL SECURITY;

-- production_interviews: 候補者は自分の面接のみ閲覧・作成可能
CREATE POLICY "candidates_view_own_interviews" ON production_interviews
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "candidates_insert_own_interviews" ON production_interviews
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "candidates_update_own_interviews" ON production_interviews
  FOR UPDATE USING (auth.uid() = candidate_id);

-- production_interviews: 企業は自社求人の面接を閲覧可能
CREATE POLICY "companies_view_job_interviews" ON production_interviews
  FOR SELECT USING (auth.uid() = company_id);

-- interview_results: 企業のみ閲覧可能（候補者には非表示）
CREATE POLICY "companies_view_results" ON interview_results
  FOR SELECT USING (auth.uid() = company_id);

-- interview_results: システム（サービスロール）のみ挿入可能
CREATE POLICY "system_insert_results" ON interview_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "system_update_results" ON interview_results
  FOR UPDATE USING (true);
