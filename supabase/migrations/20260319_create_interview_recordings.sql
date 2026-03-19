-- Interview recordings table: stores metadata about recorded interview sessions
CREATE TABLE IF NOT EXISTS interview_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID,
  category TEXT,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  speech_segments JSONB NOT NULL DEFAULT '[]',
  file_size_bytes BIGINT,
  mime_type TEXT DEFAULT 'video/webm',
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_interview_recordings_user_id ON interview_recordings(user_id);
CREATE INDEX idx_interview_recordings_assessment_id ON interview_recordings(assessment_id);

-- Enable RLS
ALTER TABLE interview_recordings ENABLE ROW LEVEL SECURITY;

-- Users can insert their own recordings
CREATE POLICY "Users can insert own recordings"
  ON interview_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own recordings
CREATE POLICY "Users can view own recordings"
  ON interview_recordings FOR SELECT USING (auth.uid() = user_id);

-- Companies can view recordings of users who applied to their jobs
CREATE POLICY "Companies can view candidate recordings"
  ON interview_recordings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = interview_recordings.user_id
        AND c.user_id = auth.uid()
    )
  );

-- Create storage bucket for interview recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-recordings', 'interview-recordings', false)
ON CONFLICT DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users can upload recordings"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'interview-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own recordings
CREATE POLICY "Users can read own recordings"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'interview-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Companies can read candidate recordings (via signed URLs generated server-side)
CREATE POLICY "Authenticated users can read recordings"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'interview-recordings'
    AND auth.role() = 'authenticated'
  );
